---
layout: post
title: Draw.io - Azure Isometric Diagram
---

{{ page.title }}
================

<p class="meta">28 Oct 2018 - Hilversum, Netherlands</p>

I was wondering how I could create a Draw.io isometric diagram for Azure just like the ones from AWS.

<a href="https://www.draw.io/?lightbox=&p=ex1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=AWS%20Diagram.html#Uhttps%3A%2F%2Fdrive.google.com%2Fa%2Fseibert-media.net%2Fuc%3Fid%3D11X9bDr9dwE16AX7KGx4EkCHtJ9fXtPTw%26export%3Ddownload">
  <img src="https://about.draw.io/wp-content/uploads/2017/07/drawio_aws_diagram_1840x900.png">
</a>

So my idea was to have a generic isometric (3D) shape as a container that you could use with shapes or images from other libraries. Therefore, I submitted some small changes to the [draw.io github repository](https://github.com/jgraph/drawio/pull/340).

<a href="https://github.com/jgraph/drawio/pull/340">
  <img src="/images/posts/2018-10-28/initial-generic-shapes.png">
</a>

You can change the shape style input (e.g. `shape=mxgraph.mscae.cloud.azure_search` within container or `indicatorImage=img/lib/mscae/Active_Directory.svg`), but it still has a lot of limitations.

This is a simple example of the results:

<img src="/images/posts/2018-10-28/serverless-test.svg">
