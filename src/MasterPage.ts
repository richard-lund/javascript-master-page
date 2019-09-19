import {Constants} from './Constants';

(function(document): void {

	async function loadMasterPage(src: string): Promise<Element> {
		const response = await fetch(src);
		if (!response.ok)
			throw Error(`Error fetching master page ${src}, status ${response.status}`);
		try {
			const content = await response.text();
			return await new DOMParser().parseFromString(content, "text/html").getElementsByTagName(Constants.MASTER_TAG)[0];
		}
		catch (error) {
			throw Error(`Error parsing master page ${src}, ${error}`);
		}
	}

	function createFragmentFromChildren(source: Element, moveScripts: boolean, scriptTarget?: HTMLElement): DocumentFragment {
		const fragment = document.createDocumentFragment();
		Array.from(source.childNodes).forEach(function(child) {
			fragment.appendChild(child);
		});
		if (moveScripts) {
			// Scripts need special treatment
			Array.from(fragment.querySelectorAll("script")).forEach(function(script) {
				const newScript = document.createElement("script");
				Array.from(script.attributes).forEach(attr => {
					newScript.setAttribute(attr.name, attr.value);
				});
				// We cannot tolerate any asynchronus loading here, because order may be important
				newScript.async = false;
				newScript.defer = false;
				newScript.textContent = script.textContent;
				scriptTarget.appendChild(newScript);

				script.parentNode.removeChild(script);
			});
		}
		
		return fragment;
	}

	const childPageElements = document.getElementsByTagName(Constants.CHILD_TAG);
	Array.from(childPageElements).forEach(function(childPageElement) {
		const onload = childPageElement.getAttribute(Constants.ONLOAD_ATTRIBUTE);
		const src = childPageElement.getAttribute(Constants.CHILD_ATTRIBUTE);
		if (src.indexOf("://") >= 0) return;

		loadMasterPage(src)
		.then(function(masterPage) {
			
			// Hide everything so they don't see changes until we're ready
			document.body.style.display = "none";
			
			const masterBlocks = Array.from(masterPage.getElementsByTagName(Constants.CONTENT_PLACEHOLDER_TAG));
			if (!masterBlocks || masterBlocks.length === 0) throw new Error('No blocks found in your master page');

			const childBlocks = Array.from(childPageElement.getElementsByTagName(Constants.CHILD_CONTENT_TAG));
			childBlocks.forEach(function(block) {
				const matchingBlock = masterBlocks.find(b => b.getAttribute(Constants.ID_ATTRIBUTE) === block.getAttribute(Constants.ID_ATTRIBUTE));
				if (!matchingBlock) {
					console.warn(`No matching ${Constants.CONTENT_PLACEHOLDER_TAG} for '${block.getAttribute(Constants.ID_ATTRIBUTE)}'`);
				} else {
					if (block.getAttribute(Constants.VISIBLE_ATTRIBUTE) === "false") {
						// This is how child pages hide a content block
						matchingBlock.parentNode.removeChild(matchingBlock);
					} else if (block.getAttribute(Constants.APPEND_ATTRIBUTE) !== "true") {
						// Default is not to append
						matchingBlock.innerHTML = "";
						matchingBlock.appendChild(createFragmentFromChildren(block, false));
					} else {
						// Append means we will add both the default and the user-provided content
						matchingBlock.appendChild(createFragmentFromChildren(block, false));
					}
				}
			});

			masterBlocks.forEach(function(block) {
				// Anything we deleted earlier can be ignored now
				if (!block.parentNode) return;
				
				if (block.getAttribute(Constants.TARGET_ATTRIBUTE) === "head") {
					// Any blocks that belong in the head need to be moved there
					document.head.appendChild(createFragmentFromChildren(block, true, document.head));
					block.parentNode.removeChild(block);
				} else {
					// Everything else gets promoted to remove its placeholder
					block.replaceWith(createFragmentFromChildren(block, false));
				}
			});

			childPageElement.parentNode.replaceChild(createFragmentFromChildren(masterPage, true, childPageElement.parentElement), childPageElement);
			// Restore the body to visibility
			document.body.style.display = "block";

			if (onload) {
				window.eval(onload);
			}
		})
		.catch(error => console.error(error));
	});

})(document);
