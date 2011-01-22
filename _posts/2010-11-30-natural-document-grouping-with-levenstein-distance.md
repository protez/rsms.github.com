---
layout: post
categories: [programming, kod, ux]
tumblr_id: 2051094800
date: 2010-11-30 20:11:49 UTC
title: Natural document grouping with Levenstein distance
---

<p>When you edit many files where there are natural pairs (for instance, interface + implementation pairs when dealing with C source code) I tend to get lost in the maze of open documents and often end up doing a project-wide search or similar to find my way between the messy graph.</p>

<p>So I got this idea that you could group documents (or rather <em>sort documents</em>) with respect to their <a href="http://en.wikipedia.org/wiki/Levenshtein_distance">Levenstein distance</a>. I implemented this into an application I&#8217;m working on and it turns out to be a really neat feature. Here&#8217;s a quick demo screencast:</p>

<iframe title="YouTube video player" class="youtube-player" type="text/html" width="640" height="450" src="http://www.youtube.com/embed/jHUp3sdKYJw?rel=0" frameborder="0"></iframe>