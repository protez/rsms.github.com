---
layout: post
categories: [programming, cocoa, kvo]
tumblr_id: 1675311839
date: 2010-11-25 01:48:00 UTC
title: A more convenient approach to manual KVO notifications
---

<p><a href="http://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/KeyValueObserving/KeyValueObserving.html">Key-Value Observing (KVO)</a> in Cocoa programming is for the most part a dance on roses &#8212; less code, less confusion, higher portability and ultimately converts your code into othogonal &#8220;modules&#8221; of awesomeness.</p>

<p>However, as soon as you use <a href="http://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/KeyValueObserving/Concepts/AutoVsManual.html#//apple_ref/doc/uid/20001844-BAJEAIEE">manual observer notification</a> things get a little messy &#8212; you need to bracket every change in a pair of <code>willChangeValueForKey:</code> and <code>didChangeValueForKey:</code>.</p>

<p><em>KVOChangeScope</em> provides a convenient way to mark manually managed properties as edited and consequently notify observers:</p>

<pre><code>- (void)doingSomething {
   kvo_scoped_change(foo);
   // code which manipulate foo, which might return at any moment
}
</code></pre>

<p>This works by placing a C++ KVOChangeScope object on the stack, which will take
care of sending |willChangeValueForKey| when created and automatically send
|didChangeValueForKey| as soon as the method return. Note that you need to
compile your source as Objective-C++ (file suffix &#8220;.mm&#8221; instead of &#8220;.m&#8221;).</p>

<p>There are also some convenience macros available, like |kvo_scoped_change| used
in the example above. The same example, without using any macros, is equivalent
to the following code:</p>

<pre><code>- (void)doingSomething {
   KVOChangeScope change_scope(self, @"foo");
   // code which manipulate foo, which might return at any moment
}
</code></pre>

<p>Another useful macro is the limited scope |kvo_change| used for a more fine-
grained control of the &#8220;will&#8221;-to-&#8220;did&#8221; scope. Here&#8217;s an illustrating example:</p>

<pre><code>- (void)doSomethingComplex {
   // modify value of foo
   kvo_change(foo) {
     foo_ = @"Foo value 1";
     if (bar)
       foo_ = @"Foo value 2";
   } // &lt;-- didChangeValueForKey:@"foo" called here
   // maybe perform slow, blocking I/O here
   // modify value of interwebs
   kvo_change(interwebs) interwebs_ = @"awesome";
   // didChangeValueForKey:@"interwebs" called here
   // maybe do some more slow stuff, not holding "edit locks" thus
   // avoiding other threads to wait on edit completion.
}
</code></pre>

<p>The whole thing is contained within a single small header which can be grabbed here:</p>

<p><a href="https://gist.github.com/714763#file_kvo_change_scope.hh"><a href="https://gist.github.com/714763#file_kvo_change_scope.hh">https://gist.github.com/714763#file_kvo_change_scope.hh</a></a></p>

<p><em>You&#8217;re free to use this code for fun or profit with the only restriction of retaining the embedded copyright notice.</em></p>