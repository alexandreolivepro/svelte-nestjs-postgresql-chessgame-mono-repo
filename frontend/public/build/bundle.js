
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.48.0 */

    function create_fragment$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(6, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(5, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(7, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ['basepath', 'url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$location,
    		$routes,
    		$base
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 128) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 96) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$location,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.48.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams, $location*/ 532)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.48.0 */
    const file$2 = "node_modules\\svelte-routing\\src\\Link.svelte";

    function create_fragment$4(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$2, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(13, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		ariaCurrent,
    		$location,
    		$base
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('to' in $$props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('isPartiallyCurrent' in $$props) $$invalidate(11, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ('isCurrent' in $$props) $$invalidate(12, isCurrent = $$new_props.isCurrent);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    		if ('ariaCurrent' in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16512) {
    			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 8193) {
    			$$invalidate(11, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 8193) {
    			$$invalidate(12, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 15361) {
    			$$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$location,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\chess\components\Piece.svelte generated by Svelte v3.48.0 */

    const file$1 = "src\\chess\\components\\Piece.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let i;
    	let i_class_value;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			attr_dev(i, "class", i_class_value = "" + (/*piece*/ ctx[0].color + "-" + /*piece*/ ctx[0].type + " svelte-5006eu"));
    			add_location(i, file$1, 338, 4, 4932);
    			attr_dev(div, "class", div_class_value = "square-" + /*piece*/ ctx[0].position + "" + " svelte-5006eu");
    			toggle_class(div, "is-selected", /*isSelected*/ ctx[1]);
    			add_location(div, file$1, 335, 0, 4847);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*piece*/ 1 && i_class_value !== (i_class_value = "" + (/*piece*/ ctx[0].color + "-" + /*piece*/ ctx[0].type + " svelte-5006eu"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*piece*/ 1 && div_class_value !== (div_class_value = "square-" + /*piece*/ ctx[0].position + "" + " svelte-5006eu")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*piece, isSelected*/ 3) {
    				toggle_class(div, "is-selected", /*isSelected*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Piece', slots, []);
    	let { piece } = $$props;
    	let { isSelected } = $$props;
    	const writable_props = ['piece', 'isSelected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Piece> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('piece' in $$props) $$invalidate(0, piece = $$props.piece);
    		if ('isSelected' in $$props) $$invalidate(1, isSelected = $$props.isSelected);
    	};

    	$$self.$capture_state = () => ({ piece, isSelected });

    	$$self.$inject_state = $$props => {
    		if ('piece' in $$props) $$invalidate(0, piece = $$props.piece);
    		if ('isSelected' in $$props) $$invalidate(1, isSelected = $$props.isSelected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [piece, isSelected, click_handler];
    }

    class Piece extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { piece: 0, isSelected: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Piece",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*piece*/ ctx[0] === undefined && !('piece' in props)) {
    			console.warn("<Piece> was created without expected prop 'piece'");
    		}

    		if (/*isSelected*/ ctx[1] === undefined && !('isSelected' in props)) {
    			console.warn("<Piece> was created without expected prop 'isSelected'");
    		}
    	}

    	get piece() {
    		throw new Error("<Piece>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set piece(value) {
    		throw new Error("<Piece>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSelected() {
    		throw new Error("<Piece>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSelected(value) {
    		throw new Error("<Piece>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\chess\components\Chessboard.svelte generated by Svelte v3.48.0 */
    const file = "src\\chess\\components\\Chessboard.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (48:12) {#each columns as column (column)}
    function create_each_block_2(key_1, ctx) {
    	let div;
    	let t0_value = /*column*/ ctx[15] + "";
    	let t0;
    	let t1_value = /*row*/ ctx[12] + "";
    	let t1;
    	let mounted;
    	let dispose;

    	function func(...args) {
    		return /*func*/ ctx[7](/*column*/ ctx[15], /*row*/ ctx[12], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(t1_value);
    			attr_dev(div, "class", "column svelte-1p4nmfw");
    			attr_dev(div, "data-square", /*column*/ ctx[15].toString() + /*row*/ ctx[12].toString());
    			toggle_class(div, "is-available", !!/*availableMoves*/ ctx[2]?.find(func));
    			add_location(div, file, 48, 16, 1034);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clickEmptySquare*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*availableMoves, columns, rows*/ 52) {
    				toggle_class(div, "is-available", !!/*availableMoves*/ ctx[2]?.find(func));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(48:12) {#each columns as column (column)}",
    		ctx
    	});

    	return block;
    }

    // (46:4) {#each rows as row (row)}
    function create_each_block_1(key_1, ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value_2 = /*columns*/ ctx[4];
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*column*/ ctx[15];
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "row d-flex svelte-1p4nmfw");
    			add_location(div, file, 46, 8, 944);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*columns, rows, availableMoves, clickEmptySquare*/ 116) {
    				each_value_2 = /*columns*/ ctx[4];
    				validate_each_argument(each_value_2);
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, div, destroy_block, create_each_block_2, null, get_each_context_2);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(46:4) {#each rows as row (row)}",
    		ctx
    	});

    	return block;
    }

    // (60:4) {#if chessboardPieces && chessboardPieces.length > 0}
    function create_if_block(ctx) {
    	let div;
    	let current;
    	let each_value = /*chessboardPieces*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "chess-pieces svelte-1p4nmfw");
    			add_location(div, file, 60, 8, 1519);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*chessboardPieces, selectedPiece, dispatch*/ 11) {
    				each_value = /*chessboardPieces*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(60:4) {#if chessboardPieces && chessboardPieces.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (62:12) {#each chessboardPieces as piece}
    function create_each_block(ctx) {
    	let piece;
    	let current;

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*piece*/ ctx[9]);
    	}

    	piece = new Piece({
    			props: {
    				piece: /*piece*/ ctx[9],
    				isSelected: /*selectedPiece*/ ctx[1]?.position === /*piece*/ ctx[9].position
    			},
    			$$inline: true
    		});

    	piece.$on("click", click_handler);

    	const block = {
    		c: function create() {
    			create_component(piece.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(piece, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const piece_changes = {};
    			if (dirty & /*chessboardPieces*/ 1) piece_changes.piece = /*piece*/ ctx[9];
    			if (dirty & /*selectedPiece, chessboardPieces*/ 3) piece_changes.isSelected = /*selectedPiece*/ ctx[1]?.position === /*piece*/ ctx[9].position;
    			piece.$set(piece_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(piece.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(piece.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(piece, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(62:12) {#each chessboardPieces as piece}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let current;
    	let each_value_1 = /*rows*/ ctx[5];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*row*/ ctx[12];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	let if_block = /*chessboardPieces*/ ctx[0] && /*chessboardPieces*/ ctx[0].length > 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "chessboard container svelte-1p4nmfw");
    			add_location(div, file, 44, 0, 869);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*columns, rows, availableMoves, clickEmptySquare*/ 116) {
    				each_value_1 = /*rows*/ ctx[5];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, destroy_block, create_each_block_1, t, get_each_context_1);
    			}

    			if (/*chessboardPieces*/ ctx[0] && /*chessboardPieces*/ ctx[0].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*chessboardPieces*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Chessboard', slots, []);
    	const dispatch = createEventDispatcher();
    	let { chessboardPieces } = $$props;
    	let { selectedPiece } = $$props;
    	let { availableMoves } = $$props;
    	const columns = [1, 2, 3, 4, 5, 6, 7, 8];
    	const rows = columns.slice().reverse();

    	function clickEmptySquare(event) {
    		if (selectedPiece) {
    			dispatch('movePiece', { square: event.target.dataset.square });
    		}
    	}

    	const writable_props = ['chessboardPieces', 'selectedPiece', 'availableMoves'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Chessboard> was created with unknown prop '${key}'`);
    	});

    	const func = (column, row, moves) => moves === +(column.toString() + row.toString());
    	const click_handler = piece => dispatch('pieceClick', piece);

    	$$self.$$set = $$props => {
    		if ('chessboardPieces' in $$props) $$invalidate(0, chessboardPieces = $$props.chessboardPieces);
    		if ('selectedPiece' in $$props) $$invalidate(1, selectedPiece = $$props.selectedPiece);
    		if ('availableMoves' in $$props) $$invalidate(2, availableMoves = $$props.availableMoves);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Piece,
    		dispatch,
    		chessboardPieces,
    		selectedPiece,
    		availableMoves,
    		columns,
    		rows,
    		clickEmptySquare
    	});

    	$$self.$inject_state = $$props => {
    		if ('chessboardPieces' in $$props) $$invalidate(0, chessboardPieces = $$props.chessboardPieces);
    		if ('selectedPiece' in $$props) $$invalidate(1, selectedPiece = $$props.selectedPiece);
    		if ('availableMoves' in $$props) $$invalidate(2, availableMoves = $$props.availableMoves);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		chessboardPieces,
    		selectedPiece,
    		availableMoves,
    		dispatch,
    		columns,
    		rows,
    		clickEmptySquare,
    		func,
    		click_handler
    	];
    }

    class Chessboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			chessboardPieces: 0,
    			selectedPiece: 1,
    			availableMoves: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chessboard",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*chessboardPieces*/ ctx[0] === undefined && !('chessboardPieces' in props)) {
    			console.warn("<Chessboard> was created without expected prop 'chessboardPieces'");
    		}

    		if (/*selectedPiece*/ ctx[1] === undefined && !('selectedPiece' in props)) {
    			console.warn("<Chessboard> was created without expected prop 'selectedPiece'");
    		}

    		if (/*availableMoves*/ ctx[2] === undefined && !('availableMoves' in props)) {
    			console.warn("<Chessboard> was created without expected prop 'availableMoves'");
    		}
    	}

    	get chessboardPieces() {
    		throw new Error("<Chessboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chessboardPieces(value) {
    		throw new Error("<Chessboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedPiece() {
    		throw new Error("<Chessboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedPiece(value) {
    		throw new Error("<Chessboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get availableMoves() {
    		throw new Error("<Chessboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set availableMoves(value) {
    		throw new Error("<Chessboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var PieceColor$1;
    (function (PieceColor) {
        PieceColor["WHITE"] = "white";
        PieceColor["BLACK"] = "black";
    })(PieceColor$1 || (PieceColor$1 = {}));

    var PieceType;
    (function (PieceType) {
        PieceType["KING"] = "king";
        PieceType["QUEEN"] = "queen";
        PieceType["ROOK"] = "rook";
        PieceType["BISHOP"] = "bishop";
        PieceType["KNIGHT"] = "knight";
        PieceType["PAWN"] = "pawn";
    })(PieceType || (PieceType = {}));

    function sliceArray(array, index) {
        return [...array.slice(0, index).concat(array.slice(index + 1))];
    }
    const range = (start, length, modifier) => Array.from({ length: length }, (_, i) => (start + (i * modifier)));

    var CheckStatus;
    (function (CheckStatus) {
        CheckStatus["CHECK"] = "check";
        CheckStatus["CHECKMATE"] = "checkmate";
        CheckStatus["STALEMATE"] = "stalemate";
    })(CheckStatus || (CheckStatus = {}));

    class ChessPieceAbstract {
        constructor(color, position) {
            this.availableMoves = [];
            this._color = color;
            this._position = position;
        }
        onMoveAction(gameStore) {
            return gameStore;
        }
        set position(position) {
            this._position = position;
        }
        get position() {
            return this._position;
        }
        get color() {
            return this._color;
        }
    }

    var PieceColor;
    (function (PieceColor) {
        PieceColor["WHITE"] = "white";
        PieceColor["BLACK"] = "black";
    })(PieceColor || (PieceColor = {}));

    const castleValues = {
        [PieceColor.WHITE]: {
            short: {
                kingDestination: 71,
                towerDefaultPosition: 81,
                towerDestination: 61,
            },
            long: {
                kingDestination: 31,
                towerDefaultPosition: 11,
                towerDestination: 41,
            }
        },
        [PieceColor.BLACK]: {
            short: {
                kingDestination: 78,
                towerDefaultPosition: 88,
                towerDestination: 68,
            },
            long: {
                kingDestination: 38,
                towerDefaultPosition: 18,
                towerDestination: 48,
            }
        },
    };
    // Black starts at the top of the chessboard and move towards the bottom
    // White starts at the bottom and move towards the top
    const movementDirection = {
        [PieceColor.WHITE]: 1,
        [PieceColor.BLACK]: -1
    };

    class King extends ChessPieceAbstract {
        constructor() {
            super(...arguments);
            this.type = PieceType.KING;
        }
        /**
         * Get the available position for the piece
         * @param pieces List of pieces on the board
         * @param moves All the moves already played in the game
         * @param isMovedPiece If we call this method to get the position of the moved piece or just to get the position of the piece on the board
         * @returns A list of position
         */
        getAvailablePositions(pieces, moves, isMovedPiece = true) {
            let availableMoves = [];
            availableMoves.push(...getAvailableMovesBySide(pieces, [-10, 10, -1, 1, 9, 11, -9, -11], this.position, this.color, 1));
            availableMoves.push(...this.getCastlingMoves(pieces, moves));
            if (isMovedPiece) {
                availableMoves = this.removeImpossibleMoves(pieces, moves, availableMoves);
            }
            return this.filterKingMovesIfHeIsChecked(pieces, availableMoves);
        }
        filterKingMovesIfHeIsChecked(board, availableMoves) {
            const piecesAttackingTheKing = getPieceAttackingTheKing(this, board);
            const kingIndex = board.findIndex((piece) => piece.type === PieceType.KING && piece.color === this.color);
            const boardWithoutKing = board.slice(0, kingIndex).concat(board.slice(kingIndex + 1));
            const piecesAttackingTheKingMoves = piecesAttackingTheKing.map((piece) => piece.getAvailablePositions(boardWithoutKing, [], false)).flat();
            return availableMoves.filter((move) => !piecesAttackingTheKingMoves.find((position) => position === move));
        }
        getPositionBetweenPieceAndOpponentKing(king, availableMoves) {
            return [];
        }
        /**
         * The king cannot go onto a square that is attacked by an opponent piece so we remove those square.
         * It also removes the castle possibilities if needed.
         */
        removeImpossibleMoves(board, moves, availableMoves) {
            const enemieAvailablePositions = board.filter((piece) => piece.color === getOppositeColor(this.color)).map((piece) => piece.availableMoves).flat();
            let newAvailableMoves = availableMoves.filter((position) => !enemieAvailablePositions.find((p) => p === position));
            newAvailableMoves = this.removeAvailableMovesAttackingPiecesDefendedByOtherPieces(board, availableMoves);
            return newAvailableMoves.filter((availableMove) => {
                return !(this.checkEmptySquareBetweenKingAndDestinationCastle(availableMove, 'long', newAvailableMoves)
                    || this.checkEmptySquareBetweenKingAndDestinationCastle(availableMove, 'short', newAvailableMoves));
            });
        }
        /**
         * The king can take opponent pieces only if they are not defended by other pieces, this function check if the king
         * will be under attack if he takes the opponent piece.
         * @param board the current board
         * @param availableMoves the available moves for the king
         * @returns the available moves
         */
        removeAvailableMovesAttackingPiecesDefendedByOtherPieces(board, availableMoves) {
            return availableMoves.filter((move) => {
                let newBoard = getBoardWithNewInstance(board);
                const hasPieceOnPossibleMove = newBoard.findIndex((piece) => piece.position === move);
                if (hasPieceOnPossibleMove > -1) {
                    newBoard = sliceArray(newBoard, newBoard.findIndex((piece) => piece.position === move));
                }
                const kingIndex = newBoard.findIndex((piece) => piece.type === PieceType.KING && piece.color === this.color);
                newBoard[kingIndex].position = move;
                newBoard = newBoard.map((piece) => {
                    piece.availableMoves = piece.getAvailablePositions(newBoard, [], false);
                    return piece;
                });
                return getPieceAttackingTheKing(newBoard[kingIndex], newBoard).length === 0;
            });
        }
        /**
         * The king cannot castle if one of the square in between him and his destination is under attack. This function check
         * if the square between him and is destination is not in the availableMoves array based on the castleType
         */
        checkEmptySquareBetweenKingAndDestinationCastle(availableMove, castleType, availableMoves) {
            const castlePosition = castleValues[this.color];
            return availableMove === castlePosition[castleType].kingDestination
                && !availableMoves.find((move) => move === (availableMove + (castleType === 'long' ? 10 : -10)));
        }
        onMoveAction(gameStore) {
            const castlePosition = castleValues[this.color];
            // Moves the tower if it's a castle
            Object.keys(castlePosition).forEach((name) => {
                const castleTowerAtStartingPosition = gameStore.board.findIndex((piece) => piece.color === this.color && piece.type === PieceType.ROOK && piece.position === castlePosition[name].towerDefaultPosition && piece.name === name);
                if (castleTowerAtStartingPosition > -1
                    && !this.hasRookAlreadyMoved(gameStore.board[castleTowerAtStartingPosition], gameStore.moves)
                    && this.position === castlePosition[name].kingDestination) {
                    gameStore.board[castleTowerAtStartingPosition].position = castlePosition[name].towerDestination;
                }
            });
            return gameStore;
        }
        getCastlingMoves(pieces, moves) {
            const availableMoves = [];
            if (getPieceAttackingTheKing(this, pieces).length > 0) {
                return [];
            }
            if (!hasAlreadyMoved(this, moves)) {
                const castlePosition = castleValues[this.color];
                Object.keys(castlePosition).forEach((name) => {
                    const castleTowerAtStartingPosition = pieces.find((piece) => piece.color === this.color && piece.type === PieceType.ROOK && piece.position === castlePosition[name].towerDefaultPosition && piece.name === name);
                    if (castleTowerAtStartingPosition && !this.hasRookAlreadyMoved(castleTowerAtStartingPosition, moves)) {
                        availableMoves.push(castlePosition[name].kingDestination);
                    }
                });
            }
            return availableMoves;
        }
        hasRookAlreadyMoved(piece, moves) {
            return moves.find((move) => { var _a; return move.piece.color === (piece === null || piece === void 0 ? void 0 : piece.color) && move.piece.type === PieceType.ROOK && ((_a = move.piece) === null || _a === void 0 ? void 0 : _a.name) === piece.name; });
        }
    }

    class Knight extends ChessPieceAbstract {
        constructor() {
            super(...arguments);
            this.type = PieceType.KNIGHT;
        }
        getAvailablePositions(pieces, moves, isMovedPiece) {
            const possibleDestination = [12, -8, -12, 8, -19, 21, 19, -21].map((modifier) => this.position + modifier);
            let availableMoves = possibleDestination.filter((destination) => !hasPieceOnPosition(pieces, destination, this.color) && !isPositionOutsideBoundaries(destination));
            if (isMovedPiece && isCheckWithoutPieceOnBoard(pieces, this)) {
                // If the piece is locked in place, we only allow moves that protect the king
                availableMoves = filterAvailableMovesIfKingIsChecked(getBoardWithoutPiece(pieces, this), this, availableMoves);
            }
            return filterAvailableMovesIfKingIsChecked(pieces, this, availableMoves);
        }
        getPositionBetweenPieceAndOpponentKing(king, availableMoves) {
            return [this.position];
        }
    }

    class Pawn extends ChessPieceAbstract {
        constructor() {
            super(...arguments);
            this.type = PieceType.PAWN;
        }
        getAvailablePositions(pieces, moves, isMovedPiece) {
            const direction = movementDirection[this.color];
            let availableMoves = [];
            const hasPieceInPossibleMovement = pieces.find((piece) => piece.position === this.position + direction);
            if (!hasPieceInPossibleMovement) {
                availableMoves.push(this.position + direction);
                if (this.isStartingPosition() && !pieces.find((piece) => piece.position === this.position + (direction * 2))) {
                    availableMoves.push(this.position + (direction * 2));
                }
            }
            // check if the pawn can take on the left side
            if (this.hasOpponentPieceAtPosition(pieces, direction, -9)) {
                availableMoves.push(this.position + (-9 * direction));
            }
            // check if the pawn can take on the right side
            if (this.hasOpponentPieceAtPosition(pieces, direction, 11)) {
                availableMoves.push(this.position + (11 * direction));
            }
            if (this.isEnPassantSituation(moves, this.position)) {
                availableMoves.push(moves[moves.length - 1].end + direction);
            }
            if (isMovedPiece && isCheckWithoutPieceOnBoard(pieces, this)) ;
            return filterAvailableMovesIfKingIsChecked(pieces, this, availableMoves);
        }
        getPositionBetweenPieceAndOpponentKing(king, availableMoves) {
            return [this.position];
        }
        onMoveAction(gameStore) {
            const { moves } = gameStore;
            const lastMove = moves[moves.length - 1];
            // We check if the situation was en passant before the move to see if we need to remove the pawn
            if (lastMove.piece.type === this.type && lastMove.piece.color === this.color && this.isEnPassantSituation(moves.slice(0, moves.length - 1), lastMove.start)) {
                const direction = movementDirection[this.color];
                const positionPawnToRemove = gameStore.board.findIndex((piece) => piece.position === (this.position - direction));
                if (positionPawnToRemove > -1) {
                    gameStore.board.splice(positionPawnToRemove, 1);
                }
            }
            return gameStore;
        }
        isEnPassantSituation(moves, position) {
            const lastMove = moves[moves.length - 1];
            return (this.color === PieceColor$1.WHITE && getLastDigitOfPosition(position) === '5' && getLastDigitOfPosition(lastMove === null || lastMove === void 0 ? void 0 : lastMove.end) === '5' && getLastDigitOfPosition(lastMove === null || lastMove === void 0 ? void 0 : lastMove.start) === '7')
                || (this.color === PieceColor$1.BLACK && getLastDigitOfPosition(position) === '4' && getLastDigitOfPosition(lastMove === null || lastMove === void 0 ? void 0 : lastMove.end) === '4' && getLastDigitOfPosition(lastMove === null || lastMove === void 0 ? void 0 : lastMove.start) === '2');
        }
        hasOpponentPieceAtPosition(pieces, direction, modifier) {
            return !!pieces.find((piece) => piece.position === this.position + (modifier * direction) && piece.color === getOppositeColor(this.color));
        }
        isStartingPosition() {
            return (this.color === PieceColor$1.BLACK && this.position.toString()[1] === '7')
                || (this.color === PieceColor$1.WHITE && this.position.toString()[1] === '2');
        }
    }

    class Queen extends ChessPieceAbstract {
        constructor() {
            super(...arguments);
            this.type = PieceType.QUEEN;
        }
        getAvailablePositions(pieces, moves, isMovedPiece) {
            let availableMoves = [];
            availableMoves.push(...getAvailableMovesBySide(pieces, [-10, 10, -1, 1, 9, 11, -9, -11], this.position, this.color));
            if (isMovedPiece && isCheckWithoutPieceOnBoard(pieces, this)) {
                // If the piece is locked in place, we only allow moves that protect the king
                availableMoves = filterAvailableMovesIfKingIsChecked(getBoardWithoutPiece(pieces, this), this, availableMoves);
            }
            return filterAvailableMovesIfKingIsChecked(pieces, this, availableMoves);
        }
        getPositionBetweenPieceAndOpponentKing(king, availableMoves) {
            let isStraightLine = getLastDigitOfPosition(this.position) === getLastDigitOfPosition(king.position) || getFirstDigitOfPosition(this.position) === getFirstDigitOfPosition(king.position);
            if (isStraightLine) {
                return getStraigthLineBetweenTwoPieces(king, this);
            }
            return getDiagonalBetweenTwoPiece(king, this);
        }
    }

    class Rook extends ChessPieceAbstract {
        constructor(color, position, name) {
            super(color, position);
            this.type = PieceType.ROOK;
            this.name = name;
        }
        getAvailablePositions(pieces, moves, isMovedPiece) {
            let availableMoves = [];
            availableMoves.push(...getAvailableMovesBySide(pieces, [-10, 10, -1, 1], this.position, this.color));
            if (isMovedPiece && isCheckWithoutPieceOnBoard(pieces, this)) {
                // If the piece is locked in place, we only allow moves that protect the king
                availableMoves = filterAvailableMovesIfKingIsChecked(getBoardWithoutPiece(pieces, this), this, availableMoves);
            }
            return filterAvailableMovesIfKingIsChecked(pieces, this, availableMoves);
        }
        getPositionBetweenPieceAndOpponentKing(king, availableMoves) {
            return getStraigthLineBetweenTwoPieces(king, this);
        }
    }

    function getOppositeColor(color) {
        return color === PieceColor$1.BLACK ? PieceColor$1.WHITE : PieceColor$1.BLACK;
    }
    /**
     * If the position finish by 0 or 9 it's not a valid position on the board
     * @param position The position to calculate
     * @returns true if the position is not a valid position
     */
    function isPositionOutsideBoundaries(position) {
        return ["0", "9"].includes(position.toString()[1]) || position < 11 || position > 88;
    }
    function hasPieceOnPosition(pieces, destination, color) {
        return pieces.some((piece) => piece.position === destination && piece.color !== getOppositeColor(color));
    }
    function hasAlreadyMoved(piece, moves) {
        return moves.some((move) => move.piece.color === piece.color && move.piece.type === piece.type);
    }
    /**
     * Calculate the available movement for a given side (left or right)
     * @param pieces The list of pieces on the board
     * @param movementValuesBySide The pieces move by a given value, for exemple going straight up is +1 or straight right is +10. This is an array of all the possible movement for a piece
     * @param startingPosition The position of the piece
     * @param color the color of the piece
     * @param distance the distance the piece can travel (default is 8 because it's the maximum any piece can travel)
     * @returns
     */
    function getAvailableMovesBySide(pieces, movementValuesBySide, startingPosition, color, distance = 8) {
        const availableMoves = [];
        movementValuesBySide.forEach((move) => {
            let position = startingPosition;
            [...Array(distance).keys()].every(() => {
                position = (position + move);
                // If the position is out of boundaries or we encounter a piece of the same color
                if (isPositionOutsideBoundaries(position)
                    || hasPieceOnPosition(pieces, position, color)) {
                    return false;
                }
                // As long as the piece doesn't encounter his own piece we add position
                availableMoves.push(position);
                // If the last added piece is an enemy piece, we break the loop because the piece cannot go further
                if (pieces.find((piece) => piece.position === position && piece.color === getOppositeColor(color))) {
                    return false;
                }
                return true;
            });
        });
        return availableMoves;
    }
    function getDiagonalBetweenTwoPiece(firstPiece, secondPiece) {
        const rangeFromBishopPosition = [-9, 9, 11, -11].map((modifier) => range(secondPiece.position, 8, modifier).filter((value) => !isPositionOutsideBoundaries(value)));
        const diagonal = rangeFromBishopPosition.filter((listePositionByDiagonal) => {
            return listePositionByDiagonal.find((position) => position === firstPiece.position);
        }).flat();
        return diagonal.filter((position) => {
            if (firstPiece.position < secondPiece.position) {
                return position > firstPiece.position && position <= secondPiece.position;
            }
            return position < firstPiece.position && position >= secondPiece.position;
        });
    }
    function getStraigthLineBetweenTwoPieces(firstPiece, secondPiece) {
        let highValue = secondPiece.position < firstPiece.position ? firstPiece.position : secondPiece.position;
        let lowValue = secondPiece.position < firstPiece.position ? secondPiece.position : firstPiece.position;
        let modifier = 1;
        let length = highValue - lowValue;
        if (getLastDigitOfPosition(secondPiece.position) === getLastDigitOfPosition(firstPiece.position)) {
            modifier = 10;
            length = +getFirstDigitOfPosition(highValue) - +getFirstDigitOfPosition(lowValue);
        }
        return range(lowValue, length + 1, modifier).filter((value) => !isPositionOutsideBoundaries(value));
    }
    function getLastDigitOfPosition(position) {
        return position === null || position === void 0 ? void 0 : position.toString()[1];
    }
    function getFirstDigitOfPosition(position) {
        return position === null || position === void 0 ? void 0 : position.toString()[0];
    }
    function getPieceAttackingTheKing(king, board) {
        const opponents = board.filter((piece) => piece.color === getOppositeColor(king.color));
        return opponents.filter((piece) => piece.availableMoves.some((move) => move === king.position));
    }
    function filterAvailableMovesIfKingIsChecked(board, currentPiece, availableMoves) {
        const [king] = board.filter((piece) => piece.type === PieceType.KING && piece.color === currentPiece.color);
        const piecesAttackingTheKing = getPieceAttackingTheKing(king, board);
        if (piecesAttackingTheKing.length > 1) {
            return [];
        }
        else if (piecesAttackingTheKing.length === 1) {
            const [pieceAttackingTheKing] = piecesAttackingTheKing;
            const onlyPossiblePosition = pieceAttackingTheKing.getPositionBetweenPieceAndOpponentKing(king, availableMoves);
            return availableMoves.filter((move) => !!onlyPossiblePosition.find((position) => position === move));
        }
        return availableMoves;
    }
    function getBoardWithoutPiece(board, pieceToRemove) {
        const pieceIndex = board.findIndex((piece) => piece.position === pieceToRemove.position);
        return sliceArray([...board], pieceIndex);
    }
    /**
     * Check if the king is under attack if a piece is not on the board to see if the piece is pinned
     * @param board The current board of pieces
     * @param pieceToCheck The piece to check if it's pinned
     * @returns
     */
    function isCheckWithoutPieceOnBoard(board, pieceToCheck) {
        const [king] = board.filter((piece) => piece.type === PieceType.KING && piece.color === pieceToCheck.color);
        const boardWithoutPiece = getBoardWithoutPiece(board, pieceToCheck);
        const pieceAttackingTheKing = getPieceAttackingTheKing(king, boardWithoutPiece.map((piece) => {
            piece.availableMoves = piece.getAvailablePositions(boardWithoutPiece, [], false);
            return piece;
        }));
        return pieceAttackingTheKing.length > 0;
    }
    function getCheckStatus(board, colorToPlay) {
        const king = board.find((piece) => piece.type === PieceType.KING && piece.color === colorToPlay);
        const pieceAttackingTheKing = getPieceAttackingTheKing(king, board);
        const pieceCanPlay = board.filter((piece) => piece.color === colorToPlay && piece.availableMoves.length > 0 && piece.type !== PieceType.KING);
        const allPieceMovement = pieceCanPlay.map((piece) => piece.availableMoves).concat(king.getAvailablePositions(board, [], true)).flat();
        if (pieceAttackingTheKing.length > 0) {
            return allPieceMovement.length === 0 ? CheckStatus.CHECKMATE : CheckStatus.CHECK;
        }
        else if (pieceAttackingTheKing.length === 0 && allPieceMovement.length === 0) {
            return CheckStatus.STALEMATE;
        }
        return null;
    }
    function getBoardWithNewInstance(board) {
        return board.map((piece) => {
            if (piece.type === PieceType.ROOK) {
                return pieceFactory(piece.type, piece.position, piece.color, piece.name);
            }
            return pieceFactory(piece.type, piece.position, piece.color);
        });
    }
    function pieceFactory(type, position, color, name) {
        switch (type) {
            case PieceType.BISHOP: {
                return new Bishop(color, position);
            }
            case PieceType.QUEEN: {
                return new Queen(color, position);
            }
            case PieceType.KING: {
                return new King(color, position);
            }
            case PieceType.PAWN: {
                return new Pawn(color, position);
            }
            case PieceType.ROOK: {
                return new Rook(color, position, name);
            }
            case PieceType.KNIGHT: {
                return new Knight(color, position);
            }
            default: {
                throw new Error('Type should be a PieceType');
            }
        }
    }

    class Bishop extends ChessPieceAbstract {
        constructor() {
            super(...arguments);
            this.type = PieceType.BISHOP;
        }
        getAvailablePositions(pieces, moves, isMovedPiece) {
            let availableMoves = getAvailableMovesBySide(pieces, [9, 11, -9, -11], this.position, this.color);
            // We remove all the availableMoves that does not protect the king is it is checked
            availableMoves = filterAvailableMovesIfKingIsChecked(pieces, this, availableMoves);
            if (isMovedPiece && isCheckWithoutPieceOnBoard(pieces, this)) {
                // If the piece is locked in place, we only allow moves that protect the king
                availableMoves = filterAvailableMovesIfKingIsChecked(getBoardWithoutPiece(pieces, this), this, availableMoves);
            }
            return availableMoves;
        }
        getPositionBetweenPieceAndOpponentKing(king, availableMoves) {
            return getDiagonalBetweenTwoPiece(king, this);
        }
    }

    const defaultChessboardWithPieces = [
        new King(PieceColor$1.WHITE, 51),
        new Queen(PieceColor$1.WHITE, 41),
        new Rook(PieceColor$1.WHITE, 11, 'long'),
        new Rook(PieceColor$1.WHITE, 81, 'short'),
        new Bishop(PieceColor$1.WHITE, 31),
        new Bishop(PieceColor$1.WHITE, 61),
        new Knight(PieceColor$1.WHITE, 21),
        new Knight(PieceColor$1.WHITE, 71),
        new Pawn(PieceColor$1.WHITE, 52),
        new Pawn(PieceColor$1.WHITE, 42),
        new Pawn(PieceColor$1.WHITE, 12),
        new Pawn(PieceColor$1.WHITE, 82),
        new Pawn(PieceColor$1.WHITE, 32),
        new Pawn(PieceColor$1.WHITE, 62),
        new Pawn(PieceColor$1.WHITE, 22),
        new Pawn(PieceColor$1.WHITE, 72),
        new King(PieceColor$1.BLACK, 58),
        new Queen(PieceColor$1.BLACK, 48),
        new Rook(PieceColor$1.BLACK, 18, 'long'),
        new Rook(PieceColor$1.BLACK, 88, 'short'),
        new Bishop(PieceColor$1.BLACK, 38),
        new Bishop(PieceColor$1.BLACK, 68),
        new Knight(PieceColor$1.BLACK, 28),
        new Knight(PieceColor$1.BLACK, 78),
        new Pawn(PieceColor$1.BLACK, 57),
        new Pawn(PieceColor$1.BLACK, 47),
        new Pawn(PieceColor$1.BLACK, 17),
        new Pawn(PieceColor$1.BLACK, 87),
        new Pawn(PieceColor$1.BLACK, 37),
        new Pawn(PieceColor$1.BLACK, 67),
        new Pawn(PieceColor$1.BLACK, 27),
        new Pawn(PieceColor$1.BLACK, 77),
    ];
    const defaultGame = {
        moves: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        board: defaultChessboardWithPieces,
        whitePlayerId: '',
        blackPlayerId: '',
        nextColorToPlay: PieceColor$1.WHITE,
        checkStatus: null,
    };

    const gameStore = writable();
    const customGameStore = {
        subscribe: gameStore.subscribe,
        setGame: (game) => {
            gameStore.set(game);
            game.board = game.board.map((value) => {
                value.availableMoves = value.getAvailablePositions(game.board, [], false);
                return value;
            });
        },
        addMove: (move) => {
            gameStore.update((game) => {
                var _a;
                if ((_a = game.availableMoves) === null || _a === void 0 ? void 0 : _a.find((availableMove) => availableMove === +move)) {
                    game.moves.push({
                        piece: game.selectedPiece,
                        start: game.selectedPiece.position,
                        end: +move,
                    });
                    // Remove the piece if there is one at the destination
                    if (game.board.findIndex((piece) => piece.position === +move) > -1) {
                        game.board.splice(game.board.findIndex((piece) => piece.position === +move), 1);
                    }
                    // Move the selected piece at the destination
                    game.board[game.board.findIndex((piece) => piece.position === game.selectedPiece.position)].position = +move;
                    // Allow the pieces to make action on the board (castling moving the rook or en passant for exemple)
                    game = game.selectedPiece.onMoveAction(game);
                    game.board = game.board.map((value) => {
                        value.availableMoves = value.getAvailablePositions(game.board, [], false);
                        return value;
                    });
                    // Reset the selectedPiece
                    game.selectedPiece = null;
                    game.availableMoves = [];
                    // Change the next player
                    game.nextColorToPlay = getOppositeColor(game.nextColorToPlay);
                    game.checkStatus = getCheckStatus(game.board, game.nextColorToPlay);
                }
                return Object.assign({}, game);
            });
        },
        setSelectedPiece: (piece) => {
            gameStore.update((game) => {
                var _a, _b;
                game.availableMoves = ((_a = game.selectedPiece) === null || _a === void 0 ? void 0 : _a.position) === piece.position ? [] : piece.getAvailablePositions(game.board, game.moves, true);
                game.selectedPiece = ((_b = game.selectedPiece) === null || _b === void 0 ? void 0 : _b.position) === piece.position ? null : piece;
                return Object.assign({}, game);
            });
        }
    };

    /* src\chess\pages\GameDetail.svelte generated by Svelte v3.48.0 */

    function create_fragment$1(ctx) {
    	let chessboard;
    	let t0;
    	let t1_value = /*currentGame*/ ctx[0].checkStatus + "";
    	let t1;
    	let current;

    	chessboard = new Chessboard({
    			props: {
    				chessboardPieces: /*currentGame*/ ctx[0].board,
    				selectedPiece: /*currentGame*/ ctx[0].selectedPiece,
    				availableMoves: /*currentGame*/ ctx[0].availableMoves
    			},
    			$$inline: true
    		});

    	chessboard.$on("pieceClick", /*handlePieceClick*/ ctx[1]);
    	chessboard.$on("movePiece", /*handleMovePiece*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(chessboard.$$.fragment);
    			t0 = space();
    			t1 = text(t1_value);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(chessboard, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const chessboard_changes = {};
    			if (dirty & /*currentGame*/ 1) chessboard_changes.chessboardPieces = /*currentGame*/ ctx[0].board;
    			if (dirty & /*currentGame*/ 1) chessboard_changes.selectedPiece = /*currentGame*/ ctx[0].selectedPiece;
    			if (dirty & /*currentGame*/ 1) chessboard_changes.availableMoves = /*currentGame*/ ctx[0].availableMoves;
    			chessboard.$set(chessboard_changes);
    			if ((!current || dirty & /*currentGame*/ 1) && t1_value !== (t1_value = /*currentGame*/ ctx[0].checkStatus + "")) set_data_dev(t1, t1_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chessboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chessboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chessboard, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GameDetail', slots, []);
    	let currentGame;
    	customGameStore.setGame(defaultGame);

    	const unsubscribe = customGameStore.subscribe(game => {
    		$$invalidate(0, currentGame = game);
    	});

    	onDestroy(() => {
    		unsubscribe();
    	});

    	function handlePieceClick(event) {
    		var _a;
    		const { detail: piece } = event;

    		if (piece.color === currentGame.nextColorToPlay) {
    			customGameStore.setSelectedPiece(piece);
    		} else if (piece.color === getOppositeColor((_a = currentGame.selectedPiece) === null || _a === void 0
    		? void 0
    		: _a.color)) {
    			customGameStore.addMove(piece.position.toString());
    		}
    	}

    	function handleMovePiece(event) {
    		customGameStore.addMove(event.detail.square);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GameDetail> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onDestroy,
    		Chessboard,
    		defaultGame,
    		gameStore: customGameStore,
    		getOppositeColor,
    		currentGame,
    		unsubscribe,
    		handlePieceClick,
    		handleMovePiece
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentGame' in $$props) $$invalidate(0, currentGame = $$props.currentGame);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentGame, handlePieceClick, handleMovePiece];
    }

    class GameDetail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameDetail",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */

    function create_fragment(ctx) {
    	let gamedetail;
    	let current;
    	gamedetail = new GameDetail({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(gamedetail.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(gamedetail, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gamedetail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gamedetail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gamedetail, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, Link, Route, GameDetail });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
