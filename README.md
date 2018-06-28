
# Problem

The web is full of fantastic content, much of which is about the real world. At present though, there are limited ways to declaratively associate content on the web with some specific thing in the real world -- at best we can infer it based on things like address or captions on a photo. As the web evolves to support augmented reality and immersive computing, a way to explicitly associate content with specific real world **places** or **things** seems like a useful addition. In particular, having declarative associations would allow developers to affirmatively place content into the real world, and enable querying the corpus of web content to find relevant information about arbitrary physical places or things.

The objective is to annotate content about real world with **landmarks**: place or thing descriptors. These landmark + content  associations together create immersive web **artifacts**, which can be discovered and composed into a variety of useful experiences. It is an explicit goal to enable artifacts on existing web content without requiring publishers to update their content.

Acknowledging and embracing the level of exploration and innovation that is happening on high precision tracking systems (e.g. indoor mapping, cm-level anchoring, etc.), it is a non-goal to define or pick any specific high precision tracking system. Instead the goal is to develop a generic framework that can accommodate the evolution of these services without requiring a redesign.

This is an early exploration of mechanisms in the Open Web Platform that would enable an ecosystem where content for AR could be published (e.g. on Wikipedia, fodors.com, opentable.com, yelp.com, etc.) in an interoperable fashion, and later viewed by content consumers (e.g. AR headsets, Google Lens, Hololens, Oculus Rift) through the exposure of artifacts on webpages.

# Strawman

While augmenting the entirety of the world seems daunting, we expect **places** and **things** to be a reasonable starting point (also, possibly in that order from least to most tractable).

For example, we expect authors to place dining menus next to restaurants, reviews next to products or information inside art museums.

Technically, authors need the infrastructure to make **associations** between real world **landmarks** and virtual **assets**. We also we need the infrastructure to **find** them on the Web (discovery) and **transport** them efficiently. Because they are going to be written by real people, we also need to find a **notation** that is ergonomic to use.

There is an increasing flow of innovation in landmark detection (e.g. computer vision enhancements) and asset formats (e.g. glTF), so it is important that the association is **unopinionated** about both specific landmarks and assets and enable/foster their independent evolution and **extension** in a de-coupled fashion without redesign of this layer (on ceilings and foundations).

In this strawman, **publishers** that wish to syndicate their AR content to **aggregators** can **register** their **assets** to **landmarks** through **markup** on their webpages. That association can picked up by aggregators (through **crawling** in the case of search engines or direct **subscription** in the case of feed readers) and displayed to users along with the associations made by other publishers. We call the grouping of **assets** and **landmarks** an **artifact** which represents a single virtual object attached to the real world.

## Assets

An **asset** is a digital resource that specifies the presentation to be placed at a **landmark** (e.g. glTF model, JPEG image, MP3 file or a subset of HTML/CSS). The structure of an asset includes:

-   An optional **mime type**, identifying how to interpret the content/url    
-   An optional **url**, that can be used to pass content by reference
-   Optional **content**, that can be used to pass content by value
-   An optional **summary** that is used to represent the asset in aggregation

Notably, the introduction of mime-type is a deliberate **extensibility** mechanism that enables new asset types to be invented / developed independently without rewriting this layer.

## Landmarks

A **landmark** is a description of a real world element to which we wish to attach an asset, such as places, people or things (e.g. a building, a restaurant, a face, a car or a coke can). This ultimately refers to the location and shape (e.g. a point, a path, a surface or a volume) of that element in the real world. The structure of landmarks includes:

-   An optional **mime type** identifying how to interpret the content body / url
-   An optional **url** that can be used to pass landmarks by reference
-   An optional **content** body that can be used to pass landmarks by value

Location resolution and computer vision are rapidly expanding fields and we expect a lot of innovation to happen in this space: new sensors, new algorithms, new data, new methods, etc. We also expect a lot of new formats (open and proprietary) to emerge.

For that purpose, in its **most extensible** form, a landmark is an opaque payload passed by reference (url) or value (content body) whose interpretation is dependent on its mimetype: new mimetypes will emerge and we won’t have to redesign the definition of landmarks as they do.

It is clear that user agents will fail to anticipate every single landmark that can ever possibly exist in the present or in the future, so we expect the extensibility mechanism to play a major role.

For example, there is an infinite stream of new things being created in the world (e.g. new coke flavors, new car models, etc), so it is a non-starter to try to bake them and enumerate them. In some form, authors needs to be able to develop modules that understand their interpretation of the real world to be used by User Agents (and all of the security and privacy implications that that entitles).

We expect machine learning to play a big role in advancing landmark detection. So, for example, one user agent could create a landmark type that takes neural network training data sets as input and let that drive computer vision and landmark detection. Another one may invent a new file format for describing inference models and use that as an extensible way to detect things.

We want to harness the power of open systems to crowd-source ideas in areas where we don't know the answer. But as we get a better handle on what the answers are in this space we want to pave the cowpaths quickly, to create the gravity well and avoid confusion/fragmentation.

With that in mind, in addition to an extensibility mechanism, we believe it is important to collect a set of well-known/well-established **built-in landmarks** that are enumerated, anticipated and baked for the most common types of associations publishers would make to get the ball rolling and start creating a [gravity well](https://hbr.org/2013/01/three-elements-of-a-successful-platform).

Some of the possible built-in landmarks are:

*   **GeoCoordinates**, formed by
    *    A pair of latitude and longitude (e.g. 37.4329° N, 122.0882° W)
*   **Postal addresses**, formed by
    *   The name (e.g. Shoreline Lake Boathouse)
    *   The street address (e.g. 3160 N Shoreline Blvd)
    *   The locality (e.g. Mountain View)  
    *   The region (e.g. CA)
    *   The postal code (e.g. 94043)
    *   The country (e.g. USA)
*  **Barcode** landmark, **QR code** landmark
    *  A regex to match its content
*   **Text** detection, formed by
    *  A regex to match its content
*  **Images** detection, formed by
    *  An example image
*  **Facial** shapes

Another example of built-in landmarks are composite landmarks: landmarks that are designed to represent the composition/combination of more than one landmark (e.g. a car inside a specific dealership). The structure of a **composite landmark** includes:

-   A base **landmark**
-   A **nearby** geo spatial restriction to apply

## Notation

As the ecosystem evolves, we’ll learn more about the ergonomics involved in creating artifacts at scale: will most people be happy with the built-in landmarks / assets? Or do we have enough open exploration in the ecosystem that most authors / user agents will use the extensibility mechanism with custom/opaque inlined payloads? Will most asset types be passed as a reference or will they be passed as a value? Will most authors come from a KML/ARML/RSS background or will most authors come from a semantic web / search engine background?

A lot of these questions will be answered in the months to come, but because our data model is agnostic to how it is transported and serialized, we don’t have to pick a serialization without cornering ourselves into it.

Two notations comes to mind as reasonable starting points of exploration: XML and JSON-LD.

On one hand, JSON-LD is a modern, RDF-based notation to encode linked data using JSON. It has found massive adoption by search engines for its expressivity and ergonomics compared to microdata/microformats/rdfa. On the downside, it carries all of the semantic web mindset (e.g. RDF/triples based), it doesn’t have guarantees on cardinality or ordering and embedding code is awkward.

On the other hand, XML is a less modern extensible markup language, largely used by feed readers and by predecessors in AR (KML and ARML). It is known by search engines (e.g. sitemaps) and is really good at embedding code.

Here is an illustrative example of an embedded JSON-LD artifact that can be embedded in any arbitrary HTML page:

An illustrative example of an JSON-LD AR Artifact

```html
<html>
  <head>...</head>
  <body>
    <script type=”application/ld+json”>
    {
      @context: “https://schema.org/”,
      @type: Artifact,
      asset: “https://code.sgo.to/parks/shoreline-park/dog.png”,
      landmark: {
        @type: GeoCoordinates,  
        latitude: “37.4334”,
        longitude: “122.0872”
      }
    }  
  </script>
</body>
</html>
```

There is still a lot to be learned on the notation to be used and we are expecting that we'll learn a lot more about the requirements and options as we go.
