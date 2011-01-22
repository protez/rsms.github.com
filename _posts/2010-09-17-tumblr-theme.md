---
layout: post
categories: [tumblr, theme]
tumblr_id: 1137689240
date: 2010-09-17 14:48:00 UTC
title: Tumblr theme
---

<p>By popular demand I am releasing the Tumblr theme I&#8217;ve created for this site. You can grab the source at <a href="http://github.com/rsms/tumblr-theme-hunch">github.com/rsms/tumblr-theme-hunch</a>. Please respect the MIT license (and remember to make love, not war).</p>

<p><strong>Disclaimer:</strong> <em>You need to modify the theme before using it, since I have my Google Analytics and 404 redirect magic embedded in the code</em>.</p>

<p>Grab the source:</p>

<pre><code>#!sh
git clone git://github.com/rsms/tumblr-theme-hunch.git
open -t tumblr-theme-hunch/index.html
</code></pre>

<p>Make your modifications to the theme code (like replacing the Google Analytics code and Disqus comments), then copy all text and paste it into &#8220;Theme&#8221; on <a href="http://www.tumblr.com/customize">your Tumblr customization web site</a>.</p>

<!-- more -->

<h2>Disqus comments</h2>

<p>I use <a href="http://disqus.com/">Disqus</a> for comments. If you like to make use of Disqus you need to change a few bits. Disabling Disqus is also an option.</p>

<p>Locate the code between:</p>

<pre><code>&lt;!-- start disqus --&gt;
about 50 lines of code here...
&lt;!-- end disqus --&gt;
</code></pre>

<p>If you want to disable Disqus comments, simply remove the code. But if you want to use Disqus, make a note of your <a href="http://disqus.com/comments/settings/">Disqus channel name</a> (mine is &#8220;hunch&#8221;) and modify the following line to match your channel name:</p>

<pre><code>var disqus_shortname = 'hunch';
</code></pre>

<h2>Disabling syntax highlighting</h2>

<p>Another thing this theme makes use of is <a href="http://code.google.com/p/google-code-prettify/">Google Prettify</a>, enabling syntax highlighting of computer code. If you do not wish to have all preformatted text highlighted, locate the following line:</p>

<pre><code>// Comment out or remove the following to disable Prettify
</code></pre>

<p>And remove the statement which follows that line (a call to <code>loadScriptAsync</code>).</p>

<h2>Google Analytics</h2>

<p>The theme code comes pre-configured for my Google Analytics account and unless you steal my domain name it&#8217;s useless to you (it will even make your site slower), so there are basically two options here: configure your own Analytics account or disable it.</p>

<p>Locate the <code>&lt;script&gt;</code> tag which include the following line:</p>

<pre><code>var _gaq = _gaq || [];
</code></pre>

<p>Remove the whole <code>&lt;script&gt;</code> block or replace it with your own Analytics &#8220;tracking code&#8221;.</p>

<h2>Redirection from old URLs</h2>

<p>As I&#8217;ve migrated many posts from my previous blog I have a need to support and redirect old URLs. This is accomplished using code outside of Tumblr, which is lazily loaded. <em>You want to remove this code</em> (or possibly provide the URL to a redirect script of your own).</p>

<p>Locate the following line:</p>

<pre><code>// Comment-out or remove the following to disable redirection
</code></pre>

<p>And remove the statement which follows that line (a call to <code>loadScriptAsync</code>).</p>