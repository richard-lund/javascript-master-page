# javascript-master-page

Back in the day, if I was going to make a large, server-based application, I'd make it using [ASP.NET Master Pages](https://docs.microsoft.com/en-us/aspnet/web-forms/overview/older-versions-getting-started/master-pages/creating-a-site-wide-layout-using-master-pages-cs).

Among the benefits that I got from using a pattern like this, it helped me extract the things that are common across all of my pages - the header, footer, and so on - and let me concentrate my time on the bits that changed. This became a great time-saver, and Java also provided an equivalent pattern called [Tag Pages](https://docs.oracle.com/cd/E19159-01/819-3669/bnalj/index.html).

Several years later, these patterns still work, and for content-based web sites, they're still a good answer. A single-page app provides many of the benefits, but also adds significant complexity, and is definitely a lot harder work if you're managing your site inside a [Content Management System](https://www.crownpeak.com/).

Fast forward several years, and there's a big push towards being able to take advantage of the almost-limitless scaling opportunities that edge-based delivery (such as [Amazon CloudFront](https://aws.amazon.com/cloudfront/)) can provide. This takes the web server out of the equation, substantially boosting performance and availability as a result.

So now we have a lightning-fast delivery mechanism available, but since the web server has effectively disappeared from the solution, there's nowhere to run our server-side master page code. It feels like it's taking a big step backward if the header/footer/etc. have to be baked into every piece of content.

Presenting... a small library that offers a JavaScript-based solution.

## Making Master Pages in JavaScript

### Creating your first master page

* First, create a new HTML file that will serve as your master page
* Add a `<content-place-holder>` element to the body, and if you want content pages to be able to refer to it (and provide content for it) set its `data-id` attribute to something
* If your `<content-place-holder>` should appear in the `<head>` element of the output, set `data-target="head"`
* Add as many place holders as you need. They can be mixed in normal markup as required. The body of each element should be the default content for the place holder
* An example master page is provided here in `master.html`
  
### Creating your first content page

* Now create another new HTML file that will serve as your first content page
* Add a `<page>` element to the body, and set its `data-master-page` attribute to a path to the master page created above
* Add a `<content>` element to the page, and set its `data-id` attribute to the id of the `<content-place-holder>` that you want to provide content for
* Set the body of the new element to be the markup you want to appear on the output
* Add as many content blocks as you need to match up with the content place holders on the master page
* Add a script reference  `<script src="dist/main.bundle.js"></script>` at the bottom of your content page
* An example content page is provided here in `index.html`
* Start your favourite web server and browse to the content page
* Profit!

## Other options

* Set `data-visible="false"` on a content block to hide it from display
* Set `data-append="true"` on a content block to append to the default content rather than to replace it
* Set `data-onload="doSomething()"` on the `<page>` element to run code after the page is completed

## Instructions

To install:
```
$ git clone https://github.com/richard-lund/javascript-master-page
$ cd javascript-master-page
$ npm install
```

To compile the TypeScript into JavaScript:
```
$ tsc -p ./tsconfig.json
```

To package up the distribution and polyfills:
```
$ npm run webpack-prod
```