
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
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
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_destroy_block(block, lookup) {
        block.f();
        destroy_block(block, lookup);
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

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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

    const defaultTinctures = {
      field: { metals: 35, colours: 49, stains: 1, patterns: 14 },
      division: { metals: 35, colours: 49, stains: 1, patterns: 8 },
      charge: { metals: 16, colours: 24, stains: 1, patterns: 0 },
      metals: { argent: 3, or: 2 },
      colours: { gules: 5, azure: 4, sable: 3, purpure: 3, vert: 2 },
      stains: { murrey: 1, sanguine: 1, tenné: 1 },
      patterns: {
        semy: 8, ermine: 6,
        vair: 4, counterVair: 1, vairInPale: 1, vairEnPointe: 2, vairAncien: 2,
        potent: 2, counterPotent: 1, potentInPale: 1, potentEnPointe: 1,
        chequy: 8, lozengy: 5, fusily: 2, pally: 8, barry: 10, gemelles: 1,
        bendy: 8, bendySinister: 4, palyBendy: 2, barryBendy: 1,
        pappellony: 2, pappellony2: 3, scaly: 1, plumetty: 1,
        masoned: 6, fretty: 3, grillage: 1, chainy: 1, maily: 2, honeycombed: 1 }
    };

    const defaultColors = {
      argent: "#fafafa",
      or: "#ffe066",
      gules: "#d7374a",
      sable: "#333333",
      azure: "#377cd7",
      vert: "#26c061",
      purpure: "#522d5b",
      murrey: "#85185b",
      sanguine: "#b63a3a",
      tenné: "#cc7f19"
    };

    const positionsSelect = [
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "y", "z",
      "kn", "bh", "df", "pq", "jo", "lm",
      "abc", "def", "ghi", "adg", "beh", "cfi",
      "jeo", "jln", "kmo", "peq", "lem",
      "bhdf", "jleh", "behdf", "acegi",
      "bdefh", "kenpq", "abcpqh",
      "abcdefgzi", "ABCDEFGHIJKL"
    ];

    const positions = {
      conventional: { e: 20, abcdefgzi: 3, beh: 3, behdf: 2, acegi: 1, kn: 3, bhdf: 1, jeo: 1, abc: 3, jln: 6, jlh: 3, kmo: 2, jleh: 1, def: 3, abcpqh: 4, ABCDEFGHIJKL: 1 },
      complex: { e: 40, beh: 1, kn: 1, jeo: 1, abc: 2, jln: 7, jlh: 2, def: 1, abcpqh: 1 },
      divisions: {
        perPale: { e: 15, pq: 5, jo: 2, jl: 2, ABCDEFGHIJKL: 1 },
        perFess: { e: 12, kn: 4, jkl: 2, gizgiz: 1, jlh: 3, kmo: 1, ABCDEFGHIJKL: 1 },
        perBend: { e: 5, lm: 5, bcfdgh: 1 },
        perBendSinister: { e: 1, jo: 1 },
        perCross: { e: 4, jlmo: 1, j: 1, jo: 2, jl: 1 },
        perChevron: { e: 1, jlh: 1, dfk: 1, dfbh: 2, bdefh: 1 },
        perChevronReversed: { e: 1, mok: 2, dfh: 2, dfbh: 1, bdefh: 1 },
        perSaltire: { bhdf: 8, e: 3, abcdefgzi: 1, bh: 1, df: 1, ABCDEFGHIJKL: 1 },
        perPile: { ee: 3, be: 2, abceh: 1, abcabc: 1, jleh: 1 }
      },
      ordinariesOn: {
        pale: { ee: 12, beh: 10, kn: 3, bb: 1 },
        fess: { ee: 1, def: 3 },
        bar: { defdefdef: 1 },
        fessCotissed: { ee: 1, def: 3 },
        fessDoubleCotissed: { ee: 1, defdef: 3 },
        bend: { ee: 2, jo: 1, joe: 1 },
        bendSinister: { ee: 1, lm: 1, lem: 4 },
        bendlet: { joejoejoe: 1 },
        bendletSinister: { lemlemlem: 1 },
        bordure: { ABCDEFGHIJKL: 1 },
        chief: { abc: 5, bbb: 1 },
        quarter: { jjj: 1 },
        canton: { yyyy: 1 },
        cross: { eeee: 1, behdfbehdf: 3, behbehbeh: 2 },
        crossParted: { e: 5, ee: 1 },
        saltire: { ee: 5, jlemo: 1 },
        saltireParted: { e: 5, ee: 1 },
        pall: { ee: 1, jleh: 5, jlhh: 3 },
        pallReversed: { ee: 1, bemo: 5 },
        pile: { bbb: 1 },
        pileInBend: { eeee: 1, eeoo: 1 },
        pileInBendSinister: { eeee: 1, eemm: 1 }
      },
      ordinariesOff: {
        pale: { yyy: 1 },
        fess: { abc: 3, abcz: 1 },
        bar: { abc: 2, abcgzi: 1, jlh: 5, bgi: 2, ach: 1 },
        gemelle: { abc: 1 },
        bend: { ccg: 2, ccc: 1 },
        bendSinister: { aai: 2, aaa: 1 },
        bendlet: { ccg: 2, ccc: 1 },
        bendletSinister: { aai: 2, aaa: 1 },
        bordure: { e: 4, jleh:2, kenken: 1, peqpeq: 1 },
        orle: { e: 4, jleh: 1, kenken: 1, peqpeq: 1 },
        chief: { emo: 2, emoz: 1, ez: 2 },
        terrace: { e: 5, def: 1, bdf: 3 },
        mount: { e: 5, def: 1, bdf: 3 },
        point: { e: 2, def: 1, bdf: 3, acbdef: 1 },
        flaunches: { e: 3, kn: 1, beh: 3 },
        gyron: { bh: 1 },
        quarter: { e: 1 },
        canton: { e: 5, beh: 1, def: 1, bdefh: 1, kn: 1 },
        cross: { acgi: 1 },
        pall: { BCKFEILGJbdmfo: 1 },
        pallReversed: { aczac: 1 },
        chevron: { ach: 3, hhh: 1 },
        chevronReversed: { bbb: 1 },
        pile: { acdfgi: 1, acac: 1 },
        pileInBend: { cg: 1 },
        pileInBendSinister: { ai: 1 },
        label: { defgzi: 2, eh: 3, defdefhmo: 1, egiegi: 1, pqn: 5 }
      },
      // charges
      inescutcheon: { e: 4, jln: 1 },
      mascle: { e: 15, abcdefgzi: 3, beh: 3, bdefh: 4, acegi: 1, kn: 3, joe: 2, abc: 3, jlh: 8, jleh: 1, df: 3, abcpqh: 4, pqe: 3, eknpq: 3 },
      lionRampant: { e: 10, def: 2, abc: 2, bdefh: 1, kn: 1, jlh: 2, abcpqh: 1 },
      lionPassant: { e: 10, def: 1, abc: 1, bdefh: 1, jlh: 1, abcpqh: 1 },
      wolfPassant: { e: 10, def: 1, abc: 1, bdefh: 1, jlh: 1, abcpqh: 1 },
      greyhoundСourant: { e: 10, def: 1, abc: 1, bdefh: 1, jlh: 1, abcpqh: 1 },
      griffinRampant: { e: 10, def: 2, abc: 2, bdefh: 1, kn: 1, jlh: 2, abcpqh: 1 },
      griffinPassant: { e: 10, def: 1, abc: 1, bdefh: 1, jlh: 1, abcpqh: 1 },
      boarRampant: { e: 12, beh: 1, kn: 1, jln: 2 },
      eagle: { e: 15, beh: 1, kn: 1, abc: 1, jlh: 2, def: 2, pq: 1 },
      raven: { e: 15, beh: 1, kn: 1, jeo: 1, abc: 3, jln: 3, def: 1 },
      wyvern: { e: 10, jln: 1 },
      garb: { e: 1, def: 3, abc: 2, beh: 1, kn: 1, jln: 3, jleh: 1, abcpqh: 1, joe: 1, lme: 1 },
      crown: { e: 10, abcdefgzi: 1, beh: 3, behdf: 2, acegi: 1, kn: 1, pq: 2, abc: 1, jln: 4, jleh: 1, def: 2, abcpqh: 3 },
      hand: { e: 10, jln: 2, kn: 1, jeo: 1, abc: 2, pqe: 1 },
      armillarySphere: {e: 1},
      tree: {e: 1},
      lymphad: {e: 1},
      head: {e: 1},
      headWreathed: {e: 1},
      cavalier: {e: 1},
      angel: {e: 1}
    };

    const lines$1 = {
      straight: 50, wavy: 8, engrailed: 4, invecked: 3, rayonne: 3, embattled: 1, raguly: 1, urdy: 1, dancetty: 1, indented: 2,
      dentilly: 1, bevilled: 1, angled: 1, flechy: 1, barby: 1, enclavy: 1, escartely: 1, arched: 2, archedReversed: 1, nowy: 1, nowyReversed: 1,
      embattledGhibellin: 1, embattledNotched: 1, embattledGrady: 1, dovetailedIndented: 1, dovetailed: 1,
      potenty: 1, potentyDexter: 1, potentySinister: 1, nebuly: 2, seaWaves: 1, dragonTeeth: 1, firTrees: 1
    };

    const divisions = {
      variants: { perPale: 5, perFess: 5, perBend: 2, perBendSinister: 1, perChevron: 1, perChevronReversed: 1, perCross: 5, perPile: 1, perSaltire: 1, gyronny: 1, chevronny: 1 },
      perPale: lines$1,
      perFess: lines$1,
      perBend: lines$1,
      perBendSinister: lines$1,
      perChevron: lines$1,
      perChevronReversed: lines$1,
      perCross: { straight: 20, wavy: 5, engrailed: 4, invecked: 3, rayonne: 1, embattled: 1, raguly: 1, urdy: 1, indented: 2, dentilly: 1, bevilled: 1, angled: 1, embattledGhibellin: 1, embattledGrady: 1, dovetailedIndented: 1, dovetailed: 1, potenty: 1, potentyDexter: 1, potentySinister: 1, nebuly: 1 },
      perPile: lines$1
    };

    const ordinaries = {
      lined: {
        pale: 7, fess: 5, bend: 3, bendSinister: 2, chief: 5, bar: 2, gemelle: 1, fessCotissed: 1, fessDoubleCotissed: 1,
        bendlet: 2, bendletSinister: 1, terrace: 3, cross: 6, crossParted: 1, saltire: 2, saltireParted: 1
      },
      straight: {
        bordure: 8, orle: 4, mount: 1, point: 2, flaunches: 1, gore: 1,
        gyron: 1, quarter: 1, canton: 2, pall: 3, pallReversed: 2, chevron: 4, chevronReversed: 3,
        pile: 2, pileInBend: 2, pileInBendSinister: 1, piles: 1, pilesInPoint: 2, label: 1
      },
      patternable: ["flaunches", "gyron", "quarter", "canton", "pall", "pallReversed", "pileInBend", "pileInBendSinister"]
    };

    const charges = {
      types: { conventional: 30, crosses: 10, animals: 2, animalHeads: 1, birds: 2, aquatic: 1, seafaring: 1, fantastic: 3, plants: 1, agriculture: 1, arms: 3, bodyparts: 1, people: 1, architecture: 1, miscellaneous: 3, inescutcheon: 3, uploaded: 0 },
      single: { conventional: 12, crosses: 8, plants: 2, animals: 10, animalHeads: 2, birds: 4, aquatic: 2, seafaring: 2, fantastic: 7, agriculture: 1, arms: 6, bodyparts: 1, people: 2, architecture: 1, miscellaneous: 10, inescutcheon: 5, uploaded: 0 },
      semy: { conventional: 4, crosses: 1 },
      conventional: {
        lozenge: 2, fusil: 4, mascle: 4, rustre: 2, lozengeFaceted: 3, lozengePloye: 1, roundel: 4, roundel2: 3, annulet: 4,
        mullet: 5, mulletPierced: 1, mulletFaceted: 1, mullet4: 3, mullet6: 4, mullet6Pierced: 1, mullet6Faceted: 1, mullet7: 1, mullet8: 1, mullet10: 1,
        estoile: 1, compassRose: 1, billet: 5, delf: 0, triangle: 3, trianglePierced: 1, goutte: 4, heart: 4, pique: 2, carreau: 1, trefle: 2,
        fleurDeLis: 6, sun: 3, sunInSplendour: 1, crescent: 5, fountain: 1
      },
      inescutcheon: {
        inescutcheonHeater: 1, inescutcheonSpanish: 1, inescutcheonFrench: 1,
        inescutcheonHorsehead: 1, inescutcheonHorsehead2: 1, inescutcheonPolish: 1, inescutcheonHessen: 1, inescutcheonSwiss: 1,
        inescutcheonBoeotian: 1, inescutcheonRoman: 1, inescutcheonKite: 1, inescutcheonOldFrench: 1, inescutcheonRenaissance: 1, inescutcheonBaroque: 1,
        inescutcheonTarge: 1, inescutcheonTarge2: 1, inescutcheonPavise: 1, inescutcheonWedged: 1,
        inescutcheonFlag: 1, inescutcheonPennon: 1, inescutcheonGuidon: 1, inescutcheonBanner: 1, inescutcheonDovetail: 1, inescutcheonGonfalon: 1, inescutcheonPennant: 1,
        inescutcheonRound: 1, inescutcheonOval: 1, inescutcheonVesicaPiscis: 1, inescutcheonSquare: 1, inescutcheonDiamond: 1, inescutcheonNo: 1,
        inescutcheonFantasy1: 1, inescutcheonFantasy2: 1, inescutcheonFantasy3: 1, inescutcheonFantasy4: 1, inescutcheonFantasy5: 1,
        inescutcheonNoldor: 1, inescutcheonGondor: 1, inescutcheonEasterling: 1, inescutcheonErebor: 1, inescutcheonIronHills: 1, inescutcheonUrukHai: 1, inescutcheonMoriaOrc: 1
      },
      crosses: {
        crossHummetty: 15, crossVoided: 1, crossPattee: 2, crossPatteeAlisee: 1, crossFormee: 1, crossFormee2: 2, crossPotent: 2, crossJerusalem:1,
        crosslet: 1, crossClechy: 3, crossBottony: 1, crossFleury: 3, crossPatonce: 1, crossPommy: 1, crossGamma: 1, crossArrowed: 1, crossFitchy: 1,
        crossCercelee: 1, crossMoline: 2, crossFourchy: 1, crossAvellane: 1, crossErminee: 1, crossBiparted: 1, crossMaltese: 3, crossTemplar: 2,
        crossCeltic: 1, crossCeltic2: 1, crossTriquetra: 1, crossCarolingian: 1, crossOccitan: 1, crossSaltire: 3, crossBurgundy: 1,
        crossLatin: 3, crossPatriarchal: 1, crossOrthodox: 1, crossCalvary: 1, crossDouble: 1, crossTau: 1, crossSantiago: 1, crossAnkh: 1
      },
      animals: {
        lionRampant: 5, lionPassant: 2, lionPassantGuardant: 1, wolfRampant: 1, wolfPassant: 1, wolfStatant: 1, greyhoundCourant: 1, boarRampant: 1,
        horseRampant: 2, horseSalient: 1, bearRampant: 2, bearPassant: 1, bullPassant: 1, goat: 1, lamb: 1, elephant: 1, camel: 1
      },
      animalHeads: { wolfHeadErased: 2, bullHeadCaboshed: 1, deerHeadCaboshed: 1, lionHeadCaboshed: 2},
      fantastic: {
        dragonPassant: 2, dragonRampant: 2, wyvern: 1, wyvernWithWingsDisplayed: 1, griffinPassant: 1, griffinRampant: 1,
        eagleTwoHeards: 2, unicornRampant: 1, pegasus: 1, serpent: 1
      },
      birds: { eagle: 9, raven: 2, cock: 3, parrot: 1, swan: 2, swanErased: 1, heron: 1, owl: 1 },
      plants: { tree: 1, oak: 1, cinquefoil: 1, rose: 1 },
      aquatic: { escallop: 5, pike: 1, cancer: 1, dolphin: 1 },
      seafaring: { anchor: 6, boat: 2, boat2: 1, lymphad: 2, armillarySphere: 1 },
      agriculture: { garb: 2, rake: 1 },
      arms: { sword: 5, sabre: 1, sabresCrossed: 1, hatchet: 2, axe: 2, lochaberAxe: 1, mallet: 1, bowWithArrow: 2, bow: 1, arrow: 1, arrowsSheaf: 1, helmet: 2 },
      bodyparts: { hand: 4, head: 1, headWreathed: 1 },
      people: { cavalier: 3, monk: 1, angel: 2 },
      architecture: { tower: 1, castle: 1 },
      miscellaneous: {
        crown: 3, orb: 1, chalice: 1, key: 1, buckle: 1, bugleHorn: 1, bugleHorn2: 1, bell: 2, pot: 1, bucket: 1, horseshoe: 3,
        attire: 1, stagsAttires: 1, ramsHorn: 1, cowHorns: 2, wing: 1, wingSword: 1, lute: 1, harp: 1, wheel: 2, crosier: 1, fasces: 1, log: 1
      },
      uploaded: {},
      natural: { fountain: "azure", garb: "or", raven: "sable" }, // charges to mainly use predefined colours
      sinister: [ // charges that can be sinister
        "crossGamma", "lionRampant", "lionPassant", "wolfRampant", "wolfPassant", "wolfStatant", "wolfHeadErased", "greyhoundСourant", "boarRampant",
        "horseRampant", "horseSalient", "bullPassant", "bearRampant", "bearPassant", "goat", "lamb", "elephant", "eagle", "raven", "cock", "parrot",
        "swan", "swanErased", "heron", "pike", "dragonPassant", "dragonRampant", "wyvern", "wyvernWithWingsDisplayed", "griffinPassant", "griffinRampant",
        "unicornRampant", "pegasus", "serpent", "hatchet", "lochaberAxe", "hand", "wing", "wingSword", "lute", "harp", "bow", "head", "headWreathed",
        "knight", "lymphad", "log", "crosier", "dolphin", "sabre", "monk", "owl", "axe", "camel", "fasces", "lionPassantGuardant", "helmet"],
      reversed: [ // charges that can be reversed
        "goutte", "mullet", "mullet7", "crescent", "crossTau", "cancer", "sword", "sabresCrossed", "hand",
        "horseshoe", "bowWithArrow", "arrow", "arrowsSheaf", "rake", "crossTriquetra", "crossLatin", "crossTau"
      ],
      patternable: [ // charges that can have pattern tincture when counterchanged
        "lozengePloye", "roundel", "annulet", "mullet4", "mullet8", "delf", "triangle", "trianglePierced",
        "sun", "fountain","inescutcheonRound", "inescutcheonSquare", "inescutcheonNo",
        "crossHummetty", "crossVoided", "crossPattee", "crossPatteeAlisee", "crossFormee", "crossFormee2",
        "crossPotent", "crossJerusalem", "crosslet", "crossClechy", "crossBottony", "crossFleury",
        "crossPatonce", "crossPommy", "crossGamma", "crossArrowed", "crossFitchy", "crossCercelee", "crossMoline",
        "crossAvellane", "crossErminee", "crossBiparted", "crossMaltese", "crossTemplar", "crossCeltic", "crossCeltic2", "crossTau"
      ],
    };

    const patternSize = {standard: 154, small: 20, smaller: 20, big: 5, smallest: 1};

    const shields = {
      types: {basic: 10, regional: 2, historical: 1, specific: 1, banner: 1, simple: 2, fantasy: 1, middleEarth: 0},
      basic: {heater: 12, spanish: 6, french: 1},
      regional: {horsehead: 1, horsehead2: 1, polish: 1, hessen: 1, swiss: 1},
      historical: {boeotian: 1, roman: 2, kite: 1, oldFrench: 5, renaissance: 2, baroque: 2},
      specific: {targe: 1, targe2: 0, pavise: 5, wedged: 10},
      banner: {flag: 1, pennon: 0, guidon: 0, banner: 0, dovetail: 1, gonfalon: 5, pennant: 0},
      simple: {round: 12, oval: 6, vesicaPiscis: 1, square: 1, diamond: 2, no: 0},
      fantasy: {fantasy1: 2, fantasy2: 2, fantasy3: 1, fantasy4: 1, fantasy5: 3},
      middleEarth: {noldor: 1, gondor: 1, easterling: 1, erebor: 1, ironHills: 1, urukHai: 1, moriaOrc: 1}
    };

    const shieldPaths = {
      heater: "m25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z",
      spanish: "m25,25 h150 v100 a75,75,0,0,1,-150,0 z",
      french: "m 25,25 h 150 v 139.15 c 0,41.745 -66,18.15 -75,36.3 -9,-18.15 -75,5.445 -75,-36.3 v 0 z",
      horsehead: "m 20,40 c 0,60 40,80 40,100 0,10 -4,15 -0.35,30 C 65,185.7 81,200 100,200 c 19.1,0 35.3,-14.6 40.5,-30.4 C 144.2,155 140,150 140,140 140,120 180,100 180,40 142.72,40 150,15 100,15 55,15 55,40 20,40 Z",
      horsehead2: "M60 20c-5 20-10 35-35 55 25 35 35 65 30 100 20 0 35 10 45 26 10-16 30-26 45-26-5-35 5-65 30-100a87 87 0 01-35-55c-25 3-55 3-80 0z",
      polish: "m 90.3,6.3 c -12.7,0 -20.7,10.9 -40.5,14 0,11.8 -4.9,23.5 -11.4,31.1 0,0 12.7,6 12.7,19.3 C 51.1,90.8 30,90.8 30,90.8 c 0,0 -3.6,7.4 -3.6,22.4 0,34.3 23.1,60.2 40.7,68.2 17.6,8 27.7,11.4 32.9,18.6 5.2,-7.3 15.3,-10.7 32.8,-18.6 17.6,-8 40.7,-33.9 40.7,-68.2 0,-15 -3.6,-22.4 -3.6,-22.4 0,0 -21.1,0 -21.1,-20.1 0,-13.3 12.7,-19.3 12.7,-19.3 C 155.1,43.7 150.2,32.1 150.2,20.3 130.4,17.2 122.5,6.3 109.7,6.3 102.5,6.3 100,10 100,10 c 0,0 -2.5,-3.7 -9.7,-3.7 z",
      hessen: "M170 20c4 5 8 13 15 20 0 0-10 0-10 15 0 100-15 140-75 145-65-5-75-45-75-145 0-15-10-15-10-15l15-20c0 15 10-5 70-5s70 20 70 5z",
      swiss: "m 25,20 c -0.1,0 25.2,8.5 37.6,8.5 C 75.1,28.5 99.1,20 100,20 c 0.6,0 24.9,8.5 37.3,8.5 C 149.8,28.5 174.4,20 175,20 l -0.3,22.6 C 173.2,160.3 100,200 100,200 100,200 26.5,160.9 25.2,42.6 Z",
      boeotian: "M150 115c-5 0-10-5-10-15s5-15 10-15c10 0 7 10 15 10 10 0 0-30 0-30-10-25-30-55-65-55S45 40 35 65c0 0-10 30 0 30 8 0 5-10 15-10 5 0 10 5 10 15s-5 15-10 15c-10 0-7-10-15-10-10 0 0 30 0 30 10 25 30 55 65 55s55-30 65-55c0 0 10-30 0-30-8 0-5 10-15 10z",
      roman: "m 160,170 c -40,20 -80,20 -120,0 V 30 C 80,10 120,10 160,30 Z",
      kite: "m 53.3,46.4 c 0,4.1 1,12.3 1,12.3 7.1,55.7 45.7,141.3 45.7,141.3 0,0 38.6,-85.6 45.7,-141.2 0,0 1,-8.1 1,-12.3 C 146.7,20.9 125.8,0.1 100,0.1 74.2,0.1 53.3,20.9 53.3,46.4 Z",
      oldFrench: "m25,25 h150 v75 a100,100,0,0,1,-75,100 a100,100,0,0,1,-75,-100 z",
      renaissance: "M 25,33.9 C 33.4,50.3 36.2,72.9 36.2,81.7 36.2,109.9 25,122.6 25,141 c 0,29.4 24.9,44.1 40.2,47.7 15.3,3.7 29.3,0 34.8,11.3 5.5,-11.3 19.6,-7.6 34.8,-11.3 C 150.1,185 175,170.3 175,141 c 0,-18.4 -11.2,-31.1 -11.2,-59.3 0,-8.8 2.8,-31.3 11.2,-47.7 L 155.7,14.4 C 138.2,21.8 119.3,25.7 100,25.7 c -19.3,0 -38.2,-3.9 -55.7,-11.3 z",
      baroque: "m 100,25 c 18,0 50,2 75,14 v 37 l -2.7,3.2 c -4.9,5.4 -6.6,9.6 -6.7,16.2 0,6.5 2,11.6 6.9,17.2 l 2.8,3.1 v 10.2 c 0,17.7 -2.2,27.7 -7.8,35.9 -5,7.3 -11.7,11.3 -32.3,19.4 -12.6,5 -20.2,8.8 -28.6,14.5 C 103.3,198 100,200 100,200 c 0,0 -2.8,-2.3 -6.4,-4.7 C 85.6,189.8 78,186 65,180.9 32.4,168.1 26.9,160.9 25.8,129.3 L 25,116 l 3.3,-3.3 c 4.8,-5.2 7,-10.7 7,-17.3 0,-6.8 -1.8,-11.1 -6.5,-16.1 L 25,76 V 39 C 50,27 82,25 100,25 Z",
      targe: "m 20,35 c 15,0 115,-60 155,-10 -5,10 -15,15 -10,50 5,45 10,70 -10,90 C 125,195 75,195 50,175 25,150 30,130 35,85 50,95 65,85 65,70 65,50 50,45 40,50 30,55 27,65 30,70 23,73 20,70 14,70 11,60 20,45 20,35 Z",
      targe2: "m 84,32.2 c 6.2,-1 19.5,-31.4 94.1,-20.2 -30.57,33.64 -21.66,67.37 -11.2,95 20.2,69.5 -41.17549,84.7 -66.88,84.7 C 74.32,191.7071 8.38,168.95 32,105.9 36.88,92.88 31,89 31,82.6 35.15,82.262199 56.79,86.17 56.5,69.8 56.20,52.74 42.2,47.9 25.9,55.2 25.9,51.4 39.8,6.7 84,32.2 Z",
      pavise: "M95 7L39.9 37.3a10 10 0 00-5.1 9.5L46 180c.4 5.2 3.7 10 9 10h90c5.3 0 9.6-4.8 10-10l10.6-133.2a10 10 0 00-5-9.5L105 7c-4.2-2.3-6.2-2.3-10 0z",
      wedged: "m 51.2,19 h 96.4 c 3.1,12.7 10.7,20.9 26.5,20.8 C 175.7,94.5 165.3,144.3 100,200 43.5,154.2 22.8,102.8 25.1,39.7 37,38.9 47.1,34.7 51.2,19 Z",
      round: "m 185,100 a 85,85 0 0 1 -85,85 85,85 0 0 1 -85,-85 85,85 0 0 1 85,-85 85,85 0 0 1 85,85",
      oval: "m 32.3,99.5 a 67.7,93.7 0 1 1 0,1.3 z",
      vesicaPiscis: "M 100,0 C 63.9,20.4 41,58.5 41,100 c 0,41.5 22.9,79.6 59,100 36.1,-20.4 59,-58.5 59,-100 C 159,58.5 136.1,20.4 100,0 Z",
      square: "M 25,25 H 175 V 175 H 25 Z",
      diamond: "M 25,100 100,200 175,100 100,0 Z",
      no: "m0,0 h200 v200 h-200 z",
      flag: "M 10,40 h180 v120 h-180 Z",
      pennon: "M 10,40 l190,60 -190,60 Z",
      guidon: "M 10,40 h190 l-65,60 65,60 h-190 Z",
      banner: "m 25,25 v 170 l 25,-40 25,40 25,-40 25,40 25,-40 25,40 V 25 Z",
      dovetail: "m 25,25 v 175 l 75,-40 75,40 V 25 Z",
      gonfalon: "m 25,25 v 125 l 75,50 75,-50 V 25 Z",
      pennant: "M 25,15 100,200 175,15 Z",
      fantasy1: "M 100,5 C 85,30 40,35 15,40 c 40,35 20,90 40,115 15,25 40,30 45,45 5,-15 30,-20 45,-45 20,-25 0,-80 40,-115 C 160,35 115,30 100,5 Z",
      fantasy2: "m 152,21 c 0,0 -27,14 -52,-4 C 75,35 48,21 48,21 50,45 30,55 30,75 60,75 60,115 32,120 c 3,40 53,50 68,80 15,-30 65,-40 68,-80 -28,-5 -28,-45 2,-45 C 170,55 150,45 152,21 Z",
      fantasy3: "M 167,67 C 165,0 35,0 33,67 c 32,-7 27,53 -3,43 -5,45 60,65 70,90 10,-25 75,-47.51058 70,-90 -30,10 -35,-50 -3,-43 z",
      fantasy4: "M100 9C55 48 27 27 13 39c23 50 3 119 49 150 14 9 28 11 38 11s27-4 38-11c55-39 24-108 49-150-14-12-45 7-87-30z",
      fantasy5: "M 100,0 C 75,25 30,25 30,25 c 0,69 20,145 70,175 50,-30 71,-106 70,-175 0,0 -45,0 -70,-25 z",
      noldor: "m 55,75 h 2 c 3,-25 38,-10 3,20 15,50 30,75 40,105 10,-30 25,-55 40,-105 -35,-30 0,-45 3,-20 h 2 C 150,30 110,20 100,0 90,20 50,30 55,75 Z",
      gondor: "m 100,200 c 15,-15 38,-35 45,-60 h 5 V 30 h -5 C 133,10 67,10 55,30 h -5 v 110 h 5 c 7,25 30,45 45,60 z",
      easterling: "M 160,185 C 120,170 80,170 40,185 V 15 c 40,15 80,15 120,0 z",
      erebor: "M25 135 V60 l22-13 16-37 h75 l15 37 22 13 v75l-22 18-16 37 H63l-16-37z",
      ironHills: "m 30,25 60,-10 10,10 10,-10 60,10 -5,125 -65,50 -65,-50 z",
      urukHai: "M 30,60 C 40,60 60,50 60,20 l -5,-3 45,-17 75,40 -5,5 -35,155 -5,-35 H 70 v 35 z",
      moriaOrc: "M45 35c5 3 7 10 13 9h19c4-2 7-4 9-9 6 1 9 9 16 11 7-2 14 0 21 0 6-3 6-10 10-15 2-5 1-10-2-15-2-4-5-14-4-16 3 6 7 11 12 14 7 3 3 12 7 16 3 6 4 12 9 18 2 4 6 8 5 14 0 6-1 12 3 18-3 6-2 13-1 20 1 6-2 12-1 18 0 6-3 13 0 18 8 4 0 8-5 7-4 3-9 3-13 9-5 5-5 13-8 19 0 6 0 15-7 16-1 6-7 6-10 12-1-6 0-6-2-9l2-19c2-4 5-12-3-12-4-5-11-5-15 1l-13-18c-3-4-2 9-3 12 2 2-4-6-7-5-8-2-8 7-11 11-2 4-5 10-8 9 3-10 3-16 1-23-1-4 2-9-4-11 0-6 1-13-2-19-4-2-9-6-13-7V91c4-7-5-13 0-19-3-7 2-11 2-18-1-6 1-12 3-17v-1z"
    };

    const shieldBox = {
      heater: "0 10 200 200",
      spanish: "0 10 200 200",
      french: "0 10 200 200",

      horsehead: "0 10 200 200",
      horsehead2: "0 10 200 200",
      polish: "0 0 200 200",
      hessen: "0 5 200 200",
      swiss: "0 10 200 200",

      boeotian: "0 0 200 200",
      roman: "0 0 200 200",
      kite: "0 0 200 200",
      oldFrench: "0 10 200 200",
      renaissance: "0 5 200 200",
      baroque: "0 10 200 200",

      targe: "0 0 200 200",
      targe2: "0 0 200 200",
      pavise: "0 0 200 200",
      wedged: "0 10 200 200",

      flag: "0 0 200 200",
      pennon: "2.5 0 200 200",
      guidon: "2.5 0 200 200",
      banner: "0 10 200 200",
      dovetail: "0 10 200 200",
      gonfalon: "0 10 200 200",
      pennant: "0 0 200 200",

      round: "0 0 200 200",
      oval: "0 0 200 200",
      vesicaPiscis: "0 0 200 200",
      square: "0 0 200 200",
      diamond: "0 0 200 200",
      no: "0 0 200 200",

      fantasy1: "0 0 200 200",
      fantasy2: "0 5 200 200",
      fantasy3: "0 5 200 200",
      fantasy4: "0 5 200 200",
      fantasy5: "0 0 200 200",

      noldor: "0 0 200 200",
      gondor: "0 5 200 200",
      easterling: "0 0 200 200",
      erebor: "0 0 200 200",
      ironHills: "0 5 200 200",
      urukHai: "0 0 200 200",
      moriaOrc: "0 0 200 200"
    };

    // size modifier applied for charges, default is 1
    const shieldSize = {
      horsehead: .9, horsehead2: .9, polish: .85, swiss: .95,
      boeotian: .75, roman: .95, kite: .65, targe2: .9, pavise: .9, wedged: .95,
      flag: .7, pennon: .5, guidon: .65, banner: .8, dovetail: .8, pennant: .6,
      oval: .95, vesicaPiscis: .8, diamond: .8, no: 1.2,
      fantasy1: .8, fantasy2: .7, fantasy3: .7, fantasy5: .9,
      noldor: .5, gondor: .75, easterling: .8, erebor: .9, urukHai: .8, moriaOrc: .7
    };

    const shieldPositions = {
      // shield-specific position: [x, y] (relative to center)
      heater: {
        a: [-43.75, -50], b: [0, -50], c: [43.75, -50],
        d: [-43.75, 0], e: [0, 0], f: [43.75, 0],
        g: [-32.25, 37.5], h: [0, 50], i: [32.25, 37.5],
        y: [-50, -50], z: [0, 62.5],
        j: [-37.5, -37.5], k: [0, -37.5], l: [37.5, -37.5],
        m: [-30, 30], n: [0, 42.5], o: [30, 30],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-66.2, -66.6], B: [-22, -66.6], C: [22, -66.6], D: [66.2, -66.6],
        K: [-66.2, -20], E: [66.2, -20],
        J: [-55.5, 26], F: [55.5, 26],
        I: [-33, 62], G: [33, 62],
        H: [0, 89.5]
      },
      spanish: {
        a: [-43.75, -50], b: [0, -50], c: [43.75, -50],
        d: [-43.75, 0], e: [0, 0], f: [43.75, 0],
        g: [-43.75, 50], h: [0, 50], i: [43.75, 50],
        y: [-50, -50], z: [0, 50],
        j: [-37.5, -37.5], k: [0, -37.5], l: [37.5, -37.5],
        m: [-37.5, 37.5], n: [0, 37.5], o: [37.5, 37.5],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-66.2, -66.6], B: [-22, -66.6], C: [22, -66.6], D: [66.2, -66.6],
        K: [-66.4, -20], E: [66.4, -20],
        J: [-66.4, 26], F: [66.4, 26],
        I: [-49, 70], G: [49, 70],
        H: [0, 92]
      },
      french: {
        a: [-43.75, -50], b: [0, -50], c: [43.75, -50],
        d: [-43.75, 0], e: [0, 0], f: [43.75, 0],
        g: [-43.75, 50], h: [0, 50], i: [43.75, 50],
        y: [-50, -50], z: [0, 65],
        j: [-37.5, -37.5], k: [0, -37.5], l: [37.5, -37.5],
        m: [-37.5, 37.5], n: [0, 37.5], o: [37.5, 37.5],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-66.2, -66.6], B: [-22, -66.6], C: [22, -66.6], D: [66.2, -66.6],
        K: [-66.4, -20], E: [66.4, -20],
        J: [-66.4, 26], F: [66.4, 26],
        I: [-65.4, 70], G: [65.4, 70],
        H: [0, 89]
      },
      horsehead: {
        a: [-43.75, -47.5], b: [0, -50], c: [43.75, -47.5],
        d: [-35, 0], e: [0, 0], f: [35, 0],
        h: [0, 50],
        y: [-50, -50], z: [0, 55],
        j: [-35, -35], k: [0, -40], l: [35, -35],
        m: [-30, 30], n: [0, 40], o: [30, 30],
        p: [-27.5, 0], q: [27.5, 0],
        A: [-71, -52], B: [-24, -73], C: [24, -73], D: [71, -52],
        K: [-62, -16], E: [62, -16],
        J: [-39, 20], F: [39, 20],
        I: [-33.5, 60], G: [33.5, 60],
        H: [0, 91.5]
      },
      horsehead2: {
        a: [-37.5, -47.5], b: [0, -50], c: [37.5, -47.5],
        d: [-35, 0], e: [0, 0], f: [35, 0],
        g: [-35, 47.5], h: [0, 50], i: [35, 47.5],
        y: [-50, -50], z: [0, 55],
        j: [-30, -30], k: [0, -40], l: [30, -30],
        m: [-30, 30], n: [0, 40], o: [30, 30],
        p: [-27.5, 0], q: [27.5, 0],
        A: [-49, -39], B: [-22, -70], C: [22, -70], D: [49, -39],
        K: [-51, -2], E: [51, -2],
        J: [-38.5, 31], F: [38.5, 31],
        I: [-35, 67], G: [35, 67],
        H: [0, 85]
      },
      polish: {
        a: [-35, -50], b: [0, -50], c: [35, -50],
        d: [-40, 0], e: [0, 0], f: [40, 0],
        g: [-37.5, 50], h: [0, 50], i: [37.5, 50],
        y: [-50, -50], z: [0, 65],
        j: [-27.5, -27.5], k: [0, -45], l: [27.5, -27.5],
        m: [-27.5, 27.5], n: [0, 45], o: [27.5, 27.5],
        p: [-32.5, 0], q: [32.5, 0],
        A: [-48, -52], B: [-23, -80], C: [23, -80], D: [48, -52],
        K: [-47, -10], E: [47, -10],
        J: [-62, 32], F: [62, 32],
        I: [-37, 68], G: [37, 68],
        H: [0, 86]
      },
      hessen: {
        a: [-43.75, -50], b: [0, -50], c: [43.75, -50],
        d: [-43.75, 0], e: [0, 0], f: [43.75, 0],
        g: [-43.75, 50], h: [0, 50], i: [43.75, 50],
        y: [-50, -50], z: [0, 52.5],
        j: [-40, -40], k: [0, -40], l: [40, -40],
        m: [-40, 40], n: [0, 40], o: [40, 40],
        p: [-40, 0], q: [40, 0],
        A: [-69, -64], B: [-22, -76], C: [22, -76], D: [69, -64],
        K: [-66.4, -20], E: [66.4, -20],
        J: [-62, 26], F: [62, 26],
        I: [-46, 70], G: [46, 70],
        H: [0, 91.5]
      },
      swiss: {
        a: [-43.75, -50], b: [0, -50], c: [43.75, -50],
        d: [-43.75, 0], e: [0, 0], f: [43.75, 0],
        g: [-32, 37.5], h: [0, 50], i: [32, 37.5],
        y: [-50, -50], z: [0, 62.5],
        j: [-37.5, -37.5], k: [0, -37.5], l: [37.5, -37.5],
        m: [-32, 32.5], n: [0, 42.5], o: [32, 32.5],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-66.2, -66.6], B: [-22, -66], C: [22, -66], D: [66.2, -66.6],
        K: [-63, -20], E: [63, -20],
        J: [-50, 26], F: [50, 26],
        I: [-29, 62], G: [29, 62],
        H: [0, 89.5]
      },
      boeotian: {
        a: [-37.5, -47.5], b: [0, -47.5], c: [37.5, -47.5],
        d: [-25, 0], e: [0, 0], f: [25, 0],
        g: [-37.5, 47.5], h: [0, 47.5], i: [37.5, 47.5],
        y: [-48, -48], z: [0, 60],
        j: [-32.5, -37.5], k: [0, -45], l: [32.5, -37.5],
        m: [-32.5, 37.5], n: [0, 45], o: [32.5, 37.5],
        p: [-20, 0], q: [20, 0],
        A: [-45, -55], B: [-20, -77], C: [20, -77], D: [45, -55],
        K: [-59, -25], E: [59, -25],
        J: [-58, 27], F: [58, 27],
        I: [-39, 63], G: [39, 63],
        H: [0, 81]
      },
      roman: {
        a: [-40, -52.5], b: [0, -52.5], c: [40, -52.5],
        d: [-40, 0], e: [0, 0], f: [40, 0],
        g: [-40, 52.5], h: [0, 52.5], i: [40, 52.5],
        y: [-42.5, -52.5], z: [0, 65],
        j: [-30, -37.5], k: [0, -37.5], l: [30, -37.5],
        m: [-30, 37.5], n: [0, 37.5], o: [30, 37.5],
        p: [-30, 0], q: [30, 0],
        A: [-51.5, -65], B: [-17, -75], C: [17, -75], D: [51.5, -65],
        K: [-51.5, -21], E: [51.5, -21],
        J: [-51.5, 21], F: [51.5, 21],
        I: [-51.5, 65], G: [51.5, 65],
        H: [-17, 75], L: [17, 75]
      },
      kite: {
        b: [0, -65], e: [0, -15], h: [0, 35],
        z: [0, 35], k: [0, -50], n: [0, 20],
        p: [-20, -15], q: [20, -15],
        A: [-38, -52], B: [-29, -78], C: [29, -78], D: [38, -52],
        K: [-33, -20], E: [33, -20],
        J: [-25, 11], F: [25, 11],
        I: [-15, 42], G: [15, 42],
        H: [0, 73], L: [0, -91]
      },
      oldFrench: {
        a: [-43.75, -50], b: [0, -50], c: [43.75, -50],
        d: [-43.75, 0], e: [0, 0], f: [43.75, 0],
        g: [-37.5, 50], h: [0, 50], i: [37.5, 50],
        y: [-50, -50], z: [0, 62.5],
        j: [-37.5, -37.5], k: [0, -37.5], l: [37.5, -37.5],
        m: [-37.5, 37.5], n: [0, 45], o: [37.5, 37.5],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-66.2, -66.6], B: [-22, -66.6], C: [22, -66.6], D: [66.2, -66.6],
        K: [-66.2, -20], E: [66.2, -20],
        J: [-64, 26], F: [64, 26],
        I: [-45, 62], G: [45, 62], 
        H: [0, 91],
      },
      renaissance: {
        a: [-43.75, -50], b: [0, -50], c: [43.75, -50],
        d: [-41.5, 0], e: [0, 0], f: [41.5, 0],
        g: [-43.75, 50], h: [0, 50], i: [43.75, 50],
        y: [-50, -50], z: [0, 62.5],
        j: [-37.5, -37.5], k: [0, -37.5], l: [37.5, -37.5],
        m: [-37.5, 37.5], n: [0, 37.5], o: [37.5, 37.5],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-61, -55], B: [-23, -67], C: [23, -67], D: [61, -55],
        K: [-55, -11], E: [55, -11],
        J: [-65, 31], F: [65, 31],
        I: [-45, 76], G: [45, 76],
        H: [0, 87]
      },
      baroque: {
        a: [-43.75, -45], b: [0, -45], c: [43.75, -45],
        d: [-43.75, 0], e: [0, 0], f: [43.75, 0],
        g: [-43.75, 50], h: [0, 50], i: [43.75, 50],
        y: [-50, -50], z: [0, 60],
        j: [-37.5, -37.5], k: [0, -37.5], l: [37.5, -37.5],
        m: [-37.5, 37.5], n: [0, 37.5], o: [37.5, 37.5],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-65, -54.5], B: [-22, -65], C: [22, -65], D: [65, -54.5],
        K: [-58.5, -15], E: [58.5, -15],
        J: [-65, 31], F: [66, 31],
        I: [-35, 73], G: [35, 73],
        H: [0, 89]
      },
      targe: {
        a: [-43.75, -50], b: [0, -50], c: [43.75, -50],
        d: [-43.75, 0], e: [0, 0], f: [43.75, 0],
        g: [-43.75, 50], h: [0, 50], i: [43.75, 50],
        y: [-50, -50], z: [0, 50],
        j: [-40, -40], k: [0, -40], l: [40, -40],
        m: [-40, 40], n: [0, 40], o: [40, 40],
        p: [-32.5, 0], q: [32.5, 0],
        A: [-66.2, -60], B: [-22, -77], C: [22, -86], D: [60, -66.6],
        K: [-28, -20], E: [57, -20],
        J: [-61, 26], F: [61, 26],
        I: [-49, 63], G: [49, 59],
        H: [0, 80]
      },
      targe2: {
        a: [-43.75, -50], b: [0, -50], c: [43.75, -50],
        d: [-40, 0], e: [0, 0], f: [40, 0],
        g: [-43.75, 50], h: [0, 50], i: [43.75, 50],
        y: [-50, -50], z: [0, 60],
        j: [-37.5, -37.5], k: [0, -37.5], l: [37.5, -37.5],
        m: [-37.5, 37.5], n: [0, 37.5], o: [37.5, 37.5],
        p: [-32.5, 0], q: [32.5, 0],
        A: [-55, -59], B: [-15, -59], C: [24, -79], D: [51, -58],
        K: [-40, -14], E: [51, -14],
        J: [-64, 26], F: [62, 26],
        I: [-46, 66], G: [48, 67],
        H: [0, 83]
      },
      pavise: {
        a: [-40, -52.5], b: [0, -52.5], c: [40, -52.5],
        d: [-40, 0], e: [0, 0], f: [40, 0],
        g: [-40, 52.5], h: [0, 52.5], i: [40, 52.5],
        y: [-42.5, -52.5], z: [0, 60],
        j: [-30, -35], k: [0, -37.5], l: [30, -35],
        m: [-30, 35], n: [0, 37.5], o: [30, 35],
        p: [-30, 0], q: [30, 0],
        A: [-57, -55], B: [-22, -74], C: [22, -74], D: [57, -55],
        K: [-54, -11], E: [54, -11],
        J: [-50, 36], F: [50, 36],
        I: [-46, 81], G: [46, 81],
        H: [0, 81]
      },
      wedged: {
        a: [-43.75, -50], b: [0, -50], c: [43.75, -50],
        d: [-43.75, 0], e: [0, 0], f: [43.75, 0],
        g: [-32.25, 37.5], h: [0, 50], i: [32.25, 37.5],
        y: [-50, -50], z: [0, 62.5],
        j: [-37.5, -37.5], k: [0, -37.5], l: [37.5, -37.5],
        m: [-32.5, 32.5], n: [0, 42.5], o: [32.5, 32.5],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-66, -53], B: [-22, -72.5], C: [22, -72.5], D: [66, -53],
        K: [-62.6, -13], E: [62.6, -13],
        J: [-50, 26], F: [50, 26],
        I: [-27, 62], G: [27, 62],
        H: [0, 87]
      },
      flag: {
        a: [-60, -40], b: [0, -40], c: [60, -40],
        d: [-60, 0], e: [0, 0], f: [60, 0],
        g: [-60, 40], h: [0, 40], i: [60, 40],
        y: [-60, -42.5], z: [0, 40],
        j: [-45, -30], k: [0, -30], l: [45, -30],
        m: [-45, 30], n: [0, 30], o: [45, 30],
        p: [-45, 0], q: [45, 0],
        A: [-81, -51], B: [-27, -51], C: [27, -51], D: [81, -51],
        K: [-81, -17], E: [81, -17],
        J: [-81, 17], F: [81, 17],
        I: [-81, 51], G: [81, 51],
        H: [-27, 51], L: [27, 51]
      },
      pennon: {
        a: [-75, -40],
        d: [-75, 0], e: [-25, 0], f: [25, 0],
        g: [-75, 40],
        y: [-70, -42.5],
        j: [-60, -30],
        m: [-60, 30],
        p: [-60, 0], q: [5, 0],
        A: [-81, -48], B: [-43, -36], C: [-4.5, -24], D: [33, -12],
        E: [72, 0],
        F: [33, 12], G: [-4.5, 24], H: [-43, 36], I: [-81, 48], 
        J: [-81, 17], K: [-81, -17]
      },
      guidon: {
        a: [-60, -40], b: [0, -40], c: [60, -40],
        d: [-60, 0], e: [0, 0],
        g: [-60, 40], h: [0, 40], i: [60, 40],
        y: [-60, -42.5], z: [0, 40],
        j: [-45, -30], k: [0, -30], l: [45, -30],
        m: [-45, 30], n: [0, 30], o: [45, 30],
        p: [-45, 0],
        A: [-81, -51], B: [-27, -51], C: [27, -51], D: [78, -51],
        K: [-81, -17], E: [40.5, -17],
        J: [-81, 17], F: [40.5, 17],
        I: [-81, 51], G: [78, 51],
        H: [-27, 51], L: [27, 51]
      },
      banner: {
        a: [-50, -50], b: [0, -50], c: [50, -50],
        d: [-50, 0], e: [0, 0], f: [50, 0],
        g: [-50, 40], h: [0, 40], i: [50, 40],
        y: [-50, -50], z: [0, 40],
        j: [-37.5, -37.5], k: [0, -37.5], l: [37.5, -37.5],
        m: [-37.5, 27.5], n: [0, 27.5], o: [37.5, 27.5],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-66.5, -66.5], B: [-22, -66.5], C: [22, -66.5], D: [66.5, -66.5],
        K: [-66.5, -20], E: [66.5, -20],
        J: [-66.5, 26], F: [66.5, 26],
        I: [-66.5, 66.5], G: [66.5, 66.5],
        H: [-25, 75], L: [25, 75]
      },
      dovetail: {
        a: [-49.75, -50], b: [0, -50], c: [49.75, -50],
        d: [-49.75, 0], e: [0, 0], f: [49.75, 0],
        g: [-49.75, 50], i: [49.75, 50],
        y: [-50, -50], z: [0, 40],
        j: [-37.5, -37.5], k: [0, -37.5], l: [37.5, -37.5],
        m: [-37.5, 37.5], n: [0, 32.5], o: [37.5, 37.5],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-66.5, -66.5], B: [-22, -66.5], C: [22, -66.5], D: [66.5, -66.5],
        K: [-66.5, -16.5], E: [66.5, -16.5],
        J: [-66.5, 34.5], F: [66.5, 34.5],
        I: [-66.5, 84.5], G: [66.5, 84.5],
        H: [-25, 64], L: [25, 64]
      },
      gonfalon: {
        a: [-49.75, -50], b: [0, -50], c: [49.75, -50],
        d: [-49.75, 0], e: [0, 0], f: [49.75, 0],
        g: [-49.75, 50], h: [0, 50], i: [49.75, 50],
        y: [-50, -50], z: [0, 50],
        j: [-37.5, -37.5], k: [0, -37.5], l: [37.5, -37.5],
        m: [-37.5, 37.5], n: [0, 37.5], o: [37.5, 37.5],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-66.5, -66.5], B: [-22, -66.5], C: [22, -66.5], D: [66.5, -66.5],
        K: [-66.5, -20], E: [66.5, -20],
        J: [-66.5, 26], F: [66.5, 26],
        I: [-40, 63], G: [40, 63],
        H: [0, 88]
      },
      pennant: {
        a: [-45, -50], b: [0, -50], c: [45, -50],
        e: [0, 0], h: [0, 50],
        y: [-50, -50], z: [0, 50],
        j: [-32.5, -37.5], k: [0, -37.5], l: [32.5, -37.5],
        n: [0, 37.5],
        A: [-60, -76], B: [-22, -76], C: [22, -76], D: [60, -76],
        K: [-46, -38], E: [46, -38],
        J: [-31, 0], F: [31, 0],
        I: [-16, 38], G: [16, 38],
        H: [0, 76]
      },
      round: {
        a: [-40, -40], b: [0, -40], c: [40, -40],
        d: [-40, 0], e: [0, 0], f: [40, 0],
        g: [-40, 40], h: [0, 40], i: [40, 40],
        y: [-48, -48], z: [0, 57.5],
        j: [-35.5, -35.5], k: [0, -37.5], l: [35.5, -35.5],
        m: [-35.5, 35.5], n: [0, 37.5], o: [35.5, 35.5],
        p: [-36.5, 0], q: [36.5, 0],
        A: [-59, -48], B: [-23, -73], C: [23, -73], D: [59, -48],
        K: [-76, -10], E: [76, -10],
        J: [-70, 31], F: [70, 31],
        I: [-42, 64], G: [42, 64],
        H: [0, 77]
      },
      oval: {
        a: [-37.5, -50], b: [0, -50], c: [37.5, -50],
        d: [-43, 0], e: [0, 0], f: [43, 0],
        g: [-37.5, 50], h: [0, 50], i: [37.5, 50],
        y: [-48, -48], z: [0, 60],
        j: [-35.5, -37.5], k: [0, -37.5], l: [35.5, -37.5],
        m: [-35.5, 37.5], n: [0, 50], o: [35.5, 37.5],
        p: [-36.5, 0], q: [36.5, 0],
        A: [-48, -48], B: [-23, -78], C: [23, -78], D: [48, -48],
        K: [-59, -10], E: [59, -10],
        J: [-55, 31], F: [55, 31],
        I: [-36, 68], G: [36, 68],
        H: [0, 85]
      },
      vesicaPiscis: {
        a: [-32, -37], b: [0, -50], c: [32, -37],
        d: [-32, 0], e: [0, 0], f: [32, 0],
        g: [-32, 37], h: [0, 50], i: [32, 37],
        y: [-50, -50], z: [0, 62],
        j: [-27.5, -27.5], k: [0, -37], l: [27.5, -27.5],
        m: [-27.5, 27.5], n: [0, 42], o: [27.5, 27.5],
        p: [-27.5, 0], q: [27.5, 0],
        A: [-45, -32], B: [-29, -63], C: [29, -63], D: [45, -32],
        K: [-50, 0], E: [50, 0],
        J: [-45, 32], F: [45, 32],
        I: [-29, 63], G: [29, 63],
        H: [0, 89], L: [0, -89]
      },
      square: {
        a: [-49.75, -50], b: [0, -50], c: [49.75, -50],
        d: [-49.75, 0], e: [0, 0], f: [49.75, 0],
        g: [-49.75, 50], h: [0, 50], i: [49.75, 50],
        y: [-50, -50], z: [0, 50],
        j: [-37.5, -37.5], k: [0, -37.5], l: [37.5, -37.5],
        m: [-37.5, 37.5], n: [0, 37.5], o: [37.5, 37.5],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-66.5, -66.5], B: [-22, -66.5], C: [22, -66.5], D: [66.5, -66.5],
        K: [-66.5, -20], E: [66.5, -20],
        J: [-66.5, 26], F: [66.5, 26],
        I: [-66.5, 66.5], G: [66.5, 66.5],
        H: [-22, 66.5], L: [22, 66.5]
      },
      diamond: {
        a: [-32, -37], b: [0, -50], c: [32, -37],
        d: [-43, 0], e: [0, 0], f: [43, 0],
        g: [-32, 37], h: [0, 50], i: [32, 37],
        y: [-50, -50], z: [0, 62],
        j: [-27.5, -27.5], k: [0, -37], l: [27.5, -27.5],
        m: [-27.5, 27.5], n: [0, 42], o: [27.5, 27.5],
        p: [-37, 0], q: [37, 0],
        A: [-43, -28], B: [-22, -56], C: [22, -56], D: [43, -28],
        K: [-63, 0], E: [63, 0],
        J: [-42, 28], F: [42, 28],
        I: [-22, 56], G: [22, 56],
        H: [0, 83], L: [0, -82]
      },
      no: {
        a: [-66.5, -66.5], b: [0, -66.5], c: [66.5, -66.5],
        d: [-66.5, 0], e: [0, 0], f: [66.5, 0],
        g: [-66.5, 66.5], h: [0, 66.5], i: [66.5, 66.5],
        y: [-50, -50], z: [0, 75],
        j: [-50, -50], k: [0, -50], l: [50, -50],
        m: [-50, 50], n: [0, 50], o: [50, 50],
        p: [-50, 0], q: [50, 0],
        A: [-91.5, -91.5], B: [-30.5, -91.5], C: [30.5, -91.5], D: [91.5, -91.5],
        K: [-91.5, -30.5], E: [91.5, -30.5],
        J: [-91.5, 30.5], F: [91.5, 30.5],
        I: [-91.5, 91.5], G: [91.5, 91.5],
        H: [-30.5, 91.5], L: [30.5, 91.5]
      },
      fantasy1: {
        a: [-45, -45], b: [0, -50], c: [45, -45],
        d: [-40, 0], e: [0, 0], f: [40, 0],
        g: [-36, 42.5], h: [0, 50], i: [36, 42.5],
        y: [-50, -50], z: [0, 60],
        j: [-37, -37], k: [0, -40], l: [37, -37],
        m: [-32, 32], n: [0, 40], o: [32, 32],
        p: [-28.5, 0], q: [28.5, 0],
        A: [-66, -55], B: [-22, -67], C: [22, -67], D: [66, -55],
        K: [-53, -20], E: [53, -20],
        J: [-46, 26], F: [46, 26],
        I: [-29, 62], G: [29, 62],
        H: [0, 84]
      },
      fantasy2: {
        a: [-45, -45], b: [0, -45], c: [45, -45],
        d: [-35, 0], e: [0, 0], f: [35, 0],
        g: [-36, 42.5], h: [0, 45], i: [36, 42.5],
        y: [-50, -50], z: [0, 55],
        j: [-32.5, -32.5], k: [0, -40], l: [32.5, -32.5],
        m: [-30, 30], n: [0, 40], o: [30, 30],
        p: [-27.5, 0], q: [27.5, 0],
        A: [-58, -35], B: [-44, -67], C: [44, -67], D: [58, -35],
        K: [-39, -5], E: [39, -5],
        J: [-57, 26], F: [57, 26],
        I: [-32, 58], G: [32, 58],
        H: [0, 83], L: [0, -72]
      },
      fantasy3: {
        a: [-40, -45], b: [0, -50], c: [40, -45],
        d: [-35, 0], e: [0, 0], f: [35, 0],
        g: [-36, 42.5], h: [0, 50], i: [36, 42.5],
        y: [-50, -50], z: [0, 55],
        j: [-32.5, -32.5], k: [0, -40], l: [32.5, -32.5],
        m: [-30, 30], n: [0, 40], o: [30, 30],
        p: [-27.5, 0], q: [27.5, 0],
        A: [-56, -42], B: [-22, -72], C: [22, -72], D: [56, -42],
        K: [-37, -11], E: [37, -11],
        J: [-60, 20], F: [60, 20],
        I: [-34, 56], G: [34, 56],
        H: [0, 83]
      },
      fantasy4: {
        a: [-50, -45], b: [0, -50], c: [50, -45],
        d: [-45, 0], e: [0, 0], f: [45, 0],
        g: [-40, 45], h: [0, 50], i: [40, 45],
        y: [-50, -50], z: [0, 62.5],
        j: [-37.5, -37.5], k: [0, -45], l: [37.5, -37.5],
        m: [-37.5, 37.5], n: [0, 45], o: [37.5, 37.5],
        p: [-35, 0], q: [35, 0],
        A: [-75, -56], B: [-36, -61], C: [36, -61], D: [75, -56],
        K: [-67, -12], E: [67, -12],
        J: [-63, 32], F: [63, 32],
        I: [-42, 75], G: [42, 75],
        H: [0, 91.5], L: [0, -79]
      },
      fantasy5: {
        a: [-45, -50], b: [0, -50], c: [45, -50],
        d: [-40, 0], e: [0, 0], f: [40, 0],
        g: [-30, 45], h: [0, 50], i: [30, 45],
        y: [-50, -50], z: [0, 60],
        j: [-37, -37], k: [0, -40], l: [37, -37],
        m: [-32, 32], n: [0, 40], o: [32, 32],
        p: [-28.5, 0], q: [28.5, 0],
        A: [-61, -67], B: [-22, -76], C: [22, -76], D: [61, -67],
        K: [-58, -25], E: [58, -25],
        J: [-48, 20], F: [48, 20],
        I: [-28.5, 60], G: [28.5, 60],
        H: [0, 89]
      },
      noldor: {
        b: [0, -65], e: [0, -15], h: [0, 35],
        z: [0, 35], k: [0, -50], n: [0, 30],
        p: [-20, -15], q: [20, -15],
        A: [-34, -47], B: [-20, -68], C: [20, -68], D: [34, -47],
        K: [-18, -20], E: [18, -20],
        J: [-26, 11], F: [26, 11],
        I: [-14, 43], G: [14, 43],
        H: [0, 74], L: [0, -85]
      },
      gondor: {
        a: [-32.5, -50], b: [0, -50], c: [32.5, -50],
        d: [-32.5, 0], e: [0, 0], f: [32.5, 0],
        g: [-32.5, 50], h: [0, 50], i: [32.5, 50],
        y: [-42.5, -52.5], z: [0, 65],
        j: [-25, -37.5], k: [0, -37.5], l: [25, -37.5],
        m: [-25, 30], n: [0, 37.5], o: [25, 30],
        p: [-25, 0], q: [25, 0],
        A: [-42, -52], B: [-17, -75], C: [17, -75], D: [42, -52],
        K: [-42, -15], E: [42, -15],
        J: [-42, 22], F: [42, 22],
        I: [-26, 60], G: [26, 60],
        H: [0, 87]
      },
      easterling: {
        a: [-40, -47.5], b: [0, -47.5], c: [40, -47.5],
        d: [-40, 0], e: [0, 0], f: [40, 0],
        g: [-40, 47.5], h: [0, 47.5], i: [40, 47.5],
        y: [-42.5, -52.5], z: [0, 65],
        j: [-30, -37.5], k: [0, -37.5], l: [30, -37.5],
        m: [-30, 37.5], n: [0, 37.5], o: [30, 37.5],
        p: [-30, 0], q: [30, 0],
        A: [-52, -72], B: [0, -65], D: [52, -72],
        K: [-52, -24], E: [52, -24],
        J: [-52, 24], F: [52, 24],
        I: [-52, 72], G: [52, 72],
        H: [0, 65]
      },
      erebor: {
        a: [-40, -40], b: [0, -55], c: [40, -40],
        d: [-40, 0], e: [0, 0], f: [40, 0],
        g: [-40, 40], h: [0, 55], i: [40, 40],
        y: [-50, -50], z: [0, 50],
        j: [-35, -35], k: [0, -45], l: [35, -35],
        m: [-35, 35], n: [0, 45], o: [35, 35],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-47, -46], B: [-22, -81], C: [22, -81], D: [47, -46],
        K: [-66.5, 0], E: [66.5, 0],
        J: [-47, 46], F: [47, 46],
        I: [-22, 81], G: [22, 81]
      },
      ironHills: {
        a: [-43.75, -50], b: [0, -50], c: [43.75, -50],
        d: [-43.25, 0], e: [0, 0], f: [43.25, 0],
        g: [-42.5, 42.5], h: [0, 50], i: [42.5, 42.5],
        y: [-50, -50], z: [0, 62.5],
        j: [-32.5, -32.5], k: [0, -40], l: [32.5, -32.5],
        m: [-32.5, 32.5], n: [0, 40], o: [32.5, 32.5],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-61, -67], B: [-22, -74], C: [22, -74], D: [61, -67],
        K: [-59, -20], E: [59, -20],
        J: [-57, 26], F: [57, 26],
        I: [-33, 64], G: [33, 64],
        H: [0, 88]
      },
      urukHai: {
        a: [-40, -45], b: [0, -45], c: [40, -45],
        d: [-36, 0], e: [0, 0], f: [36, 0],
        g: [-32.25, 40], h: [0, 40], i: [32.25, 40],
        y: [-50, -50], z: [0, 40],
        j: [-32.5, -32.5], k: [0, -37.5], l: [32.5, -32.5],
        m: [-27.5, 27.5], n: [0, 32.5], o: [27.5, 27.5],
        p: [-37.5, 0], q: [37.5, 0],
        A: [-31, -79], B: [-1, -90], C: [31, -74], D: [61, -57],
        K: [-55, -19], E: [53, -19],
        J: [-45, 19], F: [45, 19],
        I: [-33, 57], G: [35, 57],
        H: [0, 57], L: [-39, -50]
      },
      moriaOrc: {
        a: [-37.5, -37.5], b: [0, -37.5], c: [37.5, -37.5],
        d: [-37.5, 0], e: [0, 0], f: [37.5, 0],
        g: [-37.5, 37.5], h: [0, 37.5], i: [37.5, 37.5],
        y: [-50, -50], z: [0, 40],
        j: [-30, -30], k: [0, -30], l: [30, -30],
        m: [-30, 30], n: [0, 30], o: [30, 30],
        p: [-30, 0], q: [30, 0],
        A: [-48, -48], B: [-16, -50], C: [16, -46], D: [39, -61],
        K: [-52, -19], E: [52, -26],
        J: [-42, 9], F: [52, 9],
        I: [-31, 40], G: [40, 43],
        H: [4, 47]
      }
    };

    const forEach = (selector, callback) => {
        Array.from(document.querySelectorAll(selector)).forEach(element => {
            callback(element);
        });
    };
    function ra(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    // return random value from weighted array
    function rw(object, save = true) {
        if (!object.array) {
            const array = [];
            for (const key in object) {
                for (let i = 0; i < object[key]; i++) {
                    array.push(key);
                }
            }
            save &&
                Object.defineProperty(object, "array", {
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: array
                });
        }
        return object.array[Math.floor(Math.random() * object.array.length)];
    }
    function P(probability) {
        return Math.random() < probability;
    }
    function camelize(str) {
        return str
            .toLowerCase()
            .replace(/\.[^/.]+$/, "") // remove extension
            .replace(/[()]/g, "") // remove parentheses
            .replace(/[^a-zA-Z0-9]+(.)/g, (m, c) => c.toUpperCase())
            .replace(/^[0-9]/, "_"); // first char should not be a number
    }
    function capitalize(string) {
        return string
            .replace(/_/g, " ")
            .replace(/(?<!_)(?=[A-Z])/g, " ")
            .replace(/\w\S*/g, s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase());
    }
    function link(url, text) {
        return `<a href="${url}" target="_blank">${text}</a>`;
    }

    const options = defineInitialOptions();
    const size = writable(options.size);
    const grad = writable(options.grad);
    const diaper = writable(options.diaper);
    const shield = writable(options.shield);
    const colors = writable(options.colors);
    const tinctures = writable(options.tinctures);
    const background = writable(options.background);
    const scale = writable(options.scale);
    const border = writable(options.border);
    const borderWidth = writable(options.borderWidth);

    const grid = writable(options.grid);
    const showGrid = writable(options.showGrid);

    const history = writable([]);
    const matrices = writable([]);
    const matrix = writable(0);
    const state = writable({edit: 0, about: 0, i: 0});
    const message = writable(null);

    const createChangesTracker = () => {
      const {subscribe, set, update} = writable([undefined, -1]);
      let history = [];
      let position = -1;

      return {
        subscribe,
        refresh: () => set([history[position], position]), // trigger coa refresh
        length: () => history.length,
        reset: () => {
          (history = []), (position = -1);
          set([undefined, -1]);
        },
        add(value) {
          if (value === history[position]) return; // no change
          if (position < history.length - 1) history = history.slice(0, position + 1); // cut future history
          history.push(value);
          position += 1;
          set([history[position], position]);
        },
        undo: () =>
          update(() => {
            if (position > 0) position -= 1;
            return [history[position], position];
          }),
        redo: () =>
          update(() => {
            if (position < history.length - 1) position += 1;
            return [history[position], position];
          })
      };
    };
    const changes = createChangesTracker();

    function defineInitialOptions() {
      const stored = key => {
        const value = localStorage.getItem(key);
        if (value === "null") return null;
        return value;
      };

      const storedObj = key => (localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null);

      const getShieldFromURL = () => {
        const coaParam = new URL(window.location).searchParams.get("coa");
        if (!coaParam) return null;
        const coa = JSON.parse(coaParam);
        return coa?.shield;
      };

      const size = +stored("size") || 200;
      const diaper = stored("diaper") || "no";
      const grad = stored("grad") || ra(["luster", "spotlight", "backlight"]);
      const shield = getShieldFromURL() || stored("shield") || rw(shields[rw(shields.types)]);
      const colors = storedObj("colors") || JSON.parse(JSON.stringify(defaultColors));
      const tinctures = storedObj("tinctures") || JSON.parse(JSON.stringify(defaultTinctures));
      const border = stored("border") || "#333333";
      const borderWidth = +stored("borderWidth") || 1;
      const background = stored("background") || "#333333";
      const scale = +stored("scale") || 2;

      const grid = +stored("grid") || 1;
      const showGrid = storedObj("showGrid") || 0;

      return {
        size,
        diaper,
        grad,
        shield,
        colors,
        tinctures,
        border,
        borderWidth,
        background,
        scale,
        grid,
        showGrid
      };
    }

    const isFirefox = navigator.userAgent.includes("Firefox");

    async function download(i, format = "png") {
      const coas = i || i === 0 ? [document.getElementById("coa" + i)] : document.querySelectorAll("svg.coa");
      let {width, height} = coas[0].getBoundingClientRect();
      const numberX = coas.length > 1 ? Math.floor(window.innerWidth / width) : 1;
      const numberY = coas.length > 1 ? Math.ceil(coas.length / numberX) : 1;

      const scaleValue = get_store_value(scale);
      width = Math.round(width * scaleValue);
      height = Math.round(height * scaleValue);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width * numberX;
      canvas.height = height * numberY;

      let loaded = 0;
      coas.forEach(async function (svg, i) {
        const url = await getURL(svg, width, height);
        format === "svg" ? downloadVector(url) : downloadRaster(url, i);
      });

      function downloadVector(url) {
        const link = document.createElement("a");
        link.download = `armoria_${getTimestamp()}.svg`;
        link.href = url;
        link.click();
        window.setTimeout(() => window.URL.revokeObjectURL(URL), 5000);
      }

      function downloadRaster(url, i) {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          URL.revokeObjectURL(url);
          ctx.drawImage(img, (i % numberX) * width, Math.floor(i / numberX) * height, width, height);
          loaded++;
          if (loaded === coas.length) drawCanvas(canvas, format);
        };
      }
    }

    async function getURL(svg, width, height) {
      const addedElements = {};
      const clone = svg.cloneNode(true); // clone svg
      clone.setAttribute("width", width);
      clone.setAttribute("height", height);
      clone.removeAttribute("class");
      clone.removeAttribute("id");
      const d = clone.getElementsByTagName("defs")[0];

      // remove grid if any
      const grid = clone.getElementById("grid");
      const gridPattern = clone.getElementById("gridPattern");
      if (grid) grid.remove();
      if (gridPattern) gridPattern.remove();

      const gr = get_store_value(grad),
        di = get_store_value(diaper);
      if (gr && gr !== "no") d.insertAdjacentHTML("beforeend", defs.getElementById(gr).outerHTML);
      if (di && di !== "no") d.insertAdjacentHTML("beforeend", defs.getElementById(di).outerHTML);
      clone.querySelectorAll(".charge[charge]").forEach(el => {
        const charge = el.getAttribute("charge");
        if (addedElements[charge]) return;
        d.insertAdjacentHTML("beforeend", defs.getElementById(charge).outerHTML);
        addedElements[charge] = true;
      });
      const fieldPattern = clone.getElementsByClassName("field")[0].getAttribute("fill").split("(#")[1]?.split(")")[0];
      if (fieldPattern) addPattern(fieldPattern, d);
      const divisionPattern = clone.getElementsByClassName("division")[0]?.querySelector("rect").getAttribute("fill").split("(#")[1]?.split(")")[0];
      if (divisionPattern) addPattern(divisionPattern, d);

      function addPattern(pattern, d) {
        if (addedElements[pattern]) return;
        d.insertAdjacentHTML("beforeend", document.getElementById(pattern).outerHTML);

        if (pattern.slice(0, 4) === "semy") {
          const charge = pattern.match(/semy_of_(.*?)-/)[1];
          if (!addedElements[charge]) {
            d.insertAdjacentHTML("beforeend", document.getElementById(charge).outerHTML);
            addedElements[charge] = true;
          }
        }
        addedElements[pattern] = true;
      }

      const serialized = new XMLSerializer().serializeToString(clone);
      const pretty = isFirefox ? serialized : prettify(serialized); // don't prettify in Firefox
      const blob = new Blob([pretty], {type: "image/svg+xml;charset=utf-8"});
      const url = window.URL.createObjectURL(blob);
      window.setTimeout(() => window.URL.revokeObjectURL(url), 6000);
      return url;
    }

    function drawCanvas(canvas, format) {
      const link = document.createElement("a");
      link.download = `armoria_${getTimestamp()}.${format}`;

      const URL = canvas.toDataURL("image/" + format, 0.92);
      link.href = URL;
      link.click();

      setTimeout(function () {
        canvas.remove();
        window.URL.revokeObjectURL(link.href);
      }, 5000);
    }

    function getTimestamp() {
      const formatTime = time => (time < 10 ? "0" + time : time);
      const date = new Date();
      const year = date.getFullYear();
      const month = formatTime(date.getMonth() + 1);
      const day = formatTime(date.getDate());
      const hour = formatTime(date.getHours());
      const minutes = formatTime(date.getMinutes());
      const seconds = formatTime(date.getSeconds());
      return [year, month, day, hour, minutes, seconds].join("-");
    }

    function prettify(source) {
      const xmlDoc = new DOMParser().parseFromString(source, "image/svg+xml");
      const xsltDoc = new DOMParser().parseFromString(
        [
          '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
          '  <xsl:strip-space elements="*"/>',
          '  <xsl:template match="para[content-style][not(text())]">',
          '    <xsl:value-of select="normalize-space(.)"/>',
          "  </xsl:template>",
          '  <xsl:template match="node()|@*">',
          '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
          "  </xsl:template>",
          '  <xsl:output indent="yes"/>',
          "</xsl:stylesheet>"
        ].join("\n"),
        "application/xml"
      );

      const xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(xsltDoc);
      const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
      const resultXml = new XMLSerializer().serializeToString(resultDoc);
      return resultXml;
    }

    /* src\components\WindowEvents.svelte generated by Svelte v3.44.2 */

    const { window: window_1 } = globals;

    function create_fragment$A(ctx) {
    	let mounted;
    	let dispose;

    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "keydown", /*handleKeydown*/ ctx[0], false, false, false),
    					listen_dev(window_1, "touchstart", /*handleTouchStart*/ ctx[1], false, false, false),
    					listen_dev(window_1, "touchend", /*handleTouchEnd*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props, $$invalidate) {
    	let $matrix;
    	let $state;
    	let $message;
    	validate_store(matrix, 'matrix');
    	component_subscribe($$self, matrix, $$value => $$invalidate(4, $matrix = $$value));
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(5, $state = $$value));
    	validate_store(message, 'message');
    	component_subscribe($$self, message, $$value => $$invalidate(6, $message = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WindowEvents', slots, []);
    	const touch = { startX: 0, startY: 0 };

    	// prevent unwanted refresh
    	if (location.host === "azgaar.github.io" && !navigator.userAgent.includes("Electron")) {
    		window.onbeforeunload = () => "Are you sure you want to navigate away?";
    	}

    	// keyboard shortcuts
    	function handleKeydown(event) {
    		const code = event.code;
    		const ctrl = event.ctrlKey;
    		const reserved = ["Backspace", "Enter", "KeyZ", "KeyX", "KeyS", "KeyP", "KeyJ", "F1", "Escape"];
    		if (!ctrl && !reserved.includes(code)) return;
    		const active = document.activeElement.tagName;
    		if (active === "INPUT" || active === "SELECT" || active === "TEXTAREA") return;
    		event.preventDefault();

    		if (code === "Backspace" && $matrix > 0) set_store_value(matrix, $matrix -= 1, $matrix); else // Rollback
    		if (code === "Enter") set_store_value(matrix, $matrix += 1, $matrix); else // Reroll
    		if (code === "KeyZ") changes.undo(); else // Undo
    		if (code === "KeyX") changes.redo(); else // Redo
    		if (ctrl && code === "KeyS") download(null, "svg"); else // Download SVG
    		if (ctrl && code === "KeyP") download(null, "png"); else // Download PNG
    		if (ctrl && code === "KeyJ") download(null, "jpeg"); else // Download JPEG
    		if (code === "F1") set_store_value(state, $state.about = !$state.about, $state); // About

    		if (code === "Escape") close(); // Close all windows

    		function close() {
    			set_store_value(state, $state.about = 0, $state);
    			set_store_value(state, $state.raster = 0, $state);
    			set_store_value(state, $state.vector = 0, $state);
    			set_store_value(state, $state.tinctures = 0, $state);
    			set_store_value(state, $state.edit = 0, $state);
    			set_store_value(message, $message = null, $message);
    		}
    	}

    	function handleTouchStart(e) {
    		touch.startX = e.changedTouches[0].screenX;
    		touch.startY = e.changedTouches[0].screenY;
    	}

    	function handleTouchEnd(e) {
    		const menu = document.getElementById("menu");
    		const navbar = document.getElementById("navbar");
    		if (menu?.contains(e.target)) return; // cancel touch event if start area is menu
    		if (navbar?.contains(e.target)) return; // cancel touch event if start area is nav bar
    		const diffX = e.changedTouches[0].screenX - touch.startX;
    		const diffY = e.changedTouches[0].screenY - touch.startY;
    		const ratioX = Math.abs(diffX / diffY);
    		const ratioY = Math.abs(diffY / diffX);
    		const absDiff = Math.abs(ratioX > ratioY ? diffX : diffY);
    		if (absDiff < 50) return; // ignore small movements
    		if (ratioX > ratioY) diffX >= 0 ? swipeRight() : swipeLeft(); else diffY >= 0 ? swipeDown() : swipeUp();
    	}

    	function swipeRight() {
    		if ($state.edit) changes.redo(); else set_store_value(matrix, $matrix += 1, $matrix);
    	}

    	function swipeDown() {
    		set_store_value(matrix, $matrix += 1, $matrix);
    	}

    	function swipeLeft() {
    		if ($state.edit) changes.undo(); else if ($matrix > 0) set_store_value(matrix, $matrix -= 1, $matrix);
    	}

    	function swipeUp() {
    		if ($matrix > 0) set_store_value(matrix, $matrix -= 1, $matrix);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WindowEvents> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		state,
    		matrix,
    		changes,
    		message,
    		download,
    		touch,
    		handleKeydown,
    		handleTouchStart,
    		handleTouchEnd,
    		swipeRight,
    		swipeDown,
    		swipeLeft,
    		swipeUp,
    		$matrix,
    		$state,
    		$message
    	});

    	return [handleKeydown, handleTouchStart, handleTouchEnd];
    }

    class WindowEvents extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WindowEvents",
    			options,
    			id: create_fragment$A.name
    		});
    	}
    }

    const removalDelay = 20000;
    const tooltip = (element) => {
        const isTouchAvailable = "ontouchstart" in window;
        const tooltip = element.dataset.tooltip;
        const div = document.createElement("div");
        let limit;
        function mouseEnter() {
            forEach(".tooltip", el => el.remove());
            const gesture = element.getAttribute("gesture");
            const hotkey = element.getAttribute("hotkey");
            let text = tooltip;
            if (isTouchAvailable && gesture)
                text += ". Gesture: " + gesture;
            if (!isTouchAvailable && hotkey)
                text += ". Hotkey: " + hotkey;
            div.textContent = text;
            div.className = "tooltip";
            document.body.appendChild(div);
            const bbox = div.getBoundingClientRect();
            limit = [window.innerWidth - bbox.width, window.innerHeight - bbox.height];
            setTimeout(mouseLeave, removalDelay);
        }
        function mouseMove(event) {
            div.style.left = `${Math.min(event.pageX + 10, limit[0])}px`;
            div.style.top = `${Math.min(event.pageY + 10, limit[1])}px`;
        }
        function mouseLeave() {
            if (div)
                div.remove();
        }
        element.on("mouseenter", mouseEnter);
        element.on("mouseleave", mouseLeave);
        element.on("mousemove", mouseMove);
        return {
            destroy() {
                element.off("mouseenter", mouseEnter);
                element.off("mouseleave", mouseLeave);
                element.off("mousemove", mouseMove);
            }
        };
    };

    /* src\components\navigation\Lock.svelte generated by Svelte v3.44.2 */
    const file$z = "src\\components\\navigation\\Lock.svelte";

    // (13:0) {#if Boolean(locked)}
    function create_if_block$g(ctx) {
    	let span;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text("🔖");
    			attr_dev(span, "data-tooltip", /*tip*/ ctx[1]);
    			attr_dev(span, "class", "svelte-e703nl");
    			add_location(span, file$z, 13, 2, 443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "click", /*unlock*/ ctx[2], false, false, false),
    					action_destroyer(tooltip.call(null, span))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$g.name,
    		type: "if",
    		source: "(13:0) {#if Boolean(locked)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$z(ctx) {
    	let show_if = Boolean(/*locked*/ ctx[0]);
    	let if_block_anchor;
    	let if_block = show_if && create_if_block$g(ctx);

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
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*locked*/ 1) show_if = Boolean(/*locked*/ ctx[0]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$g(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$z($$self, $$props, $$invalidate) {
    	let locked;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Lock', slots, []);
    	let { key } = $$props;
    	const tip = capitalize(key) + " value is saved and auto-applied. Click to remove saved value and use default settings on load";

    	function unlock(event) {
    		event.stopPropagation();
    		localStorage.removeItem(key);
    		$$invalidate(0, locked = "");
    	}

    	const writable_props = ['key'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Lock> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('key' in $$props) $$invalidate(3, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({
    		tooltip,
    		capitalize,
    		key,
    		tip,
    		unlock,
    		locked
    	});

    	$$self.$inject_state = $$props => {
    		if ('key' in $$props) $$invalidate(3, key = $$props.key);
    		if ('locked' in $$props) $$invalidate(0, locked = $$props.locked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*key*/ 8) {
    			$$invalidate(0, locked = localStorage.getItem(key));
    		}
    	};

    	return [locked, tip, unlock, key];
    }

    class Lock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, { key: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lock",
    			options,
    			id: create_fragment$z.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[3] === undefined && !('key' in props)) {
    			console.warn("<Lock> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<Lock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Lock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function draw(node, { delay = 0, speed, duration, easing = cubicInOut } = {}) {
        let len = node.getTotalLength();
        const style = getComputedStyle(node);
        if (style.strokeLinecap !== 'butt') {
            len += parseInt(style.strokeWidth);
        }
        if (duration === undefined) {
            if (speed === undefined) {
                duration = 800;
            }
            else {
                duration = len / speed;
            }
        }
        else if (typeof duration === 'function') {
            duration = duration(len);
        }
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `stroke-dasharray: ${t * len} ${u * len}`
        };
    }

    const sizes = [
      [80, "Giant"],
      [100, "Huge"],
      [150, "Large"],
      [200, "Medium"],
      [300, "Small"],
      [400, "Tiny"]
    ];

    const gradients = ["no", "luster", "spotlight", "backlight", "brink"];

    const diapers = ["no", "nourse", "tessellation", "sennwald", "sulzbach"];

    /* src\components\navigation\Navbar.svelte generated by Svelte v3.44.2 */

    const { Object: Object_1$b, console: console_1$1 } = globals;
    const file$y = "src\\components\\navigation\\Navbar.svelte";

    function get_each_context$g(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[52] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[55] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[58] = list[i];
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[61] = list[i];
    	return child_ctx;
    }

    function get_each_context_4$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[64] = list[i];
    	return child_ctx;
    }

    // (130:16) {#each Object.keys(shields[type]) as sh}
    function create_each_block_4$1(ctx) {
    	let bt;
    	let svg;
    	let path;
    	let t0;
    	let t1_value = /*sh*/ ctx[64].split(/(?=[A-Z])/).join(" ") + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[21](/*sh*/ ctx[64], ...args);
    	}

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(path, "d", shieldPaths[/*sh*/ ctx[64]]);
    			add_location(path, file$y, 132, 22, 5409);
    			attr_dev(svg, "class", "shield svelte-9l3r24");
    			attr_dev(svg, "width", "26");
    			attr_dev(svg, "height", "26");
    			attr_dev(svg, "viewBox", "0 0 200 210");
    			toggle_class(svg, "selected", /*sh*/ ctx[64] === /*$shield*/ ctx[6]);
    			add_location(svg, file$y, 131, 20, 5288);
    			attr_dev(bt, "class", "svelte-9l3r24");
    			add_location(bt, file$y, 130, 18, 5214);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);
    			append_dev(bt, svg);
    			append_dev(svg, path);
    			append_dev(bt, t0);
    			append_dev(bt, t1);
    			append_dev(bt, t2);

    			if (!mounted) {
    				dispose = listen_dev(bt, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*$shield*/ 64) {
    				toggle_class(svg, "selected", /*sh*/ ctx[64] === /*$shield*/ ctx[6]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4$1.name,
    		type: "each",
    		source: "(130:16) {#each Object.keys(shields[type]) as sh}",
    		ctx
    	});

    	return block;
    }

    // (127:10) {#each Object.keys(shields.types) as type}
    function create_each_block_3$1(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let bl;
    	let t1_value = /*type*/ ctx[61].split(/(?=[A-Z])/).join(" ") + "";
    	let t1;
    	let t2;
    	let each_value_4 = Object.keys(shields[/*type*/ ctx[61]]);
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4$1(get_each_context_4$1(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			bl = element("bl");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(div0, "class", "dropdown level3 iconed svelte-9l3r24");
    			add_location(div0, file$y, 128, 14, 5100);
    			attr_dev(bl, "class", "svelte-9l3r24");
    			add_location(bl, file$y, 139, 14, 5610);
    			attr_dev(div1, "class", "container svelte-9l3r24");
    			add_location(div1, file$y, 127, 12, 5061);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, bl);
    			append_dev(bl, t1);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*change, $shield*/ 16448) {
    				each_value_4 = Object.keys(shields[/*type*/ ctx[61]]);
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4$1(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(127:10) {#each Object.keys(shields.types) as type}",
    		ctx
    	});

    	return block;
    }

    // (147:10) {#key $shield}
    function create_key_block_3(ctx) {
    	let lock;
    	let current;
    	lock = new Lock({ props: { key: "shield" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(lock.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(lock, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lock.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lock.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(lock, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_3.name,
    		type: "key",
    		source: "(147:10) {#key $shield}",
    		ctx
    	});

    	return block;
    }

    // (160:10) {#each gradients as g}
    function create_each_block_2$1(ctx) {
    	let bt;
    	let t_value = /*g*/ ctx[58] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[23](/*g*/ ctx[58], ...args);
    	}

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			t = text(t_value);
    			attr_dev(bt, "class", "svelte-9l3r24");
    			toggle_class(bt, "selected", /*g*/ ctx[58] === /*$grad*/ ctx[8]);
    			add_location(bt, file$y, 160, 12, 6320);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);
    			append_dev(bt, t);

    			if (!mounted) {
    				dispose = listen_dev(bt, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*$grad*/ 256) {
    				toggle_class(bt, "selected", /*g*/ ctx[58] === /*$grad*/ ctx[8]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(160:10) {#each gradients as g}",
    		ctx
    	});

    	return block;
    }

    // (165:10) {#key $grad}
    function create_key_block_2(ctx) {
    	let lock;
    	let current;
    	lock = new Lock({ props: { key: "grad" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(lock.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(lock, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lock.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lock.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(lock, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_2.name,
    		type: "key",
    		source: "(165:10) {#key $grad}",
    		ctx
    	});

    	return block;
    }

    // (172:10) {#each diapers as d}
    function create_each_block_1$4(ctx) {
    	let bt;
    	let t_value = /*d*/ ctx[55] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[24](/*d*/ ctx[55], ...args);
    	}

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			t = text(t_value);
    			attr_dev(bt, "class", "svelte-9l3r24");
    			toggle_class(bt, "selected", /*d*/ ctx[55] === /*$diaper*/ ctx[9]);
    			add_location(bt, file$y, 172, 12, 6760);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);
    			append_dev(bt, t);

    			if (!mounted) {
    				dispose = listen_dev(bt, "click", click_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*$diaper*/ 512) {
    				toggle_class(bt, "selected", /*d*/ ctx[55] === /*$diaper*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(172:10) {#each diapers as d}",
    		ctx
    	});

    	return block;
    }

    // (177:10) {#key $diaper}
    function create_key_block_1(ctx) {
    	let lock;
    	let current;
    	lock = new Lock({ props: { key: "diaper" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(lock.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(lock, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lock.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lock.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(lock, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_1.name,
    		type: "key",
    		source: "(177:10) {#key $diaper}",
    		ctx
    	});

    	return block;
    }

    // (184:10) {#each sizes as s}
    function create_each_block$g(ctx) {
    	let bt;
    	let t_value = /*s*/ ctx[52][1] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[25](/*s*/ ctx[52], ...args);
    	}

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			t = text(t_value);
    			attr_dev(bt, "class", "svelte-9l3r24");
    			toggle_class(bt, "selected", /*$size*/ ctx[10] == /*s*/ ctx[52][0]);
    			add_location(bt, file$y, 184, 12, 7211);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);
    			append_dev(bt, t);

    			if (!mounted) {
    				dispose = listen_dev(bt, "click", click_handler_4, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*$size*/ 1024) {
    				toggle_class(bt, "selected", /*$size*/ ctx[10] == /*s*/ ctx[52][0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$g.name,
    		type: "each",
    		source: "(184:10) {#each sizes as s}",
    		ctx
    	});

    	return block;
    }

    // (189:10) {#key $size}
    function create_key_block$2(ctx) {
    	let lock;
    	let current;
    	lock = new Lock({ props: { key: "size" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(lock.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(lock, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lock.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lock.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(lock, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block$2.name,
    		type: "key",
    		source: "(189:10) {#key $size}",
    		ctx
    	});

    	return block;
    }

    // (198:12) {#if $border !== "#333333"}
    function create_if_block_11$2(ctx) {
    	let svg;
    	let use;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			use = svg_element("use");
    			attr_dev(use, "href", "#undo-icon");
    			add_location(use, file$y, 204, 16, 7985);
    			attr_dev(svg, "class", "navBarIcon active smaller svelte-9l3r24");
    			attr_dev(svg, "data-tooltip", "Restore default color");
    			add_location(svg, file$y, 198, 14, 7732);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, use);

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler_5*/ ctx[26], false, false, false),
    					action_destroyer(tooltip.call(null, svg))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$2.name,
    		type: "if",
    		source: "(198:12) {#if $border !== \\\"#333333\\\"}",
    		ctx
    	});

    	return block;
    }

    // (212:12) {#if $borderWidth !== 1}
    function create_if_block_10$2(ctx) {
    	let svg;
    	let use;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			use = svg_element("use");
    			attr_dev(use, "href", "#undo-icon");
    			add_location(use, file$y, 218, 16, 8484);
    			attr_dev(svg, "class", "navBarIcon active smaller svelte-9l3r24");
    			attr_dev(svg, "data-tooltip", "Restore default border width");
    			add_location(svg, file$y, 212, 14, 8214);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, use);

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler_6*/ ctx[28], false, false, false),
    					action_destroyer(tooltip.call(null, svg))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$2.name,
    		type: "if",
    		source: "(212:12) {#if $borderWidth !== 1}",
    		ctx
    	});

    	return block;
    }

    // (247:12) {#if $background !== "#333333"}
    function create_if_block_9$2(ctx) {
    	let svg;
    	let use;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			use = svg_element("use");
    			attr_dev(use, "href", "#undo-icon");
    			add_location(use, file$y, 253, 16, 9656);
    			attr_dev(svg, "class", "navBarIcon active smaller svelte-9l3r24");
    			attr_dev(svg, "data-tooltip", "Restore default color");
    			add_location(svg, file$y, 247, 14, 9395);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, use);

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler_7*/ ctx[30], false, false, false),
    					action_destroyer(tooltip.call(null, svg))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$2.name,
    		type: "if",
    		source: "(247:12) {#if $background !== \\\"#333333\\\"}",
    		ctx
    	});

    	return block;
    }

    // (277:6) {#if !wideScreen && $state.edit}
    function create_if_block_8$2(ctx) {
    	let bt;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			bt.textContent = "License";
    			attr_dev(bt, "data-tooltip", "Show information about license");
    			attr_dev(bt, "class", "svelte-9l3r24");
    			add_location(bt, file$y, 277, 8, 10456);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(bt, "click", /*click_handler_8*/ ctx[34], false, false, false),
    					action_destroyer(tooltip.call(null, bt))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$2.name,
    		type: "if",
    		source: "(277:6) {#if !wideScreen && $state.edit}",
    		ctx
    	});

    	return block;
    }

    // (287:2) {:else}
    function create_else_block_2(ctx) {
    	let bd;
    	let raw_value = /*getIcon*/ ctx[13]("rollback", "inactive") + "";

    	const block = {
    		c: function create() {
    			bd = element("bd");
    			attr_dev(bd, "class", "svelte-9l3r24");
    			add_location(bd, file$y, 287, 4, 10820);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bd, anchor);
    			bd.innerHTML = raw_value;
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bd);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(287:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (283:2) {#if $matrix}
    function create_if_block_7$3(ctx) {
    	let bt;
    	let raw_value = /*getIcon*/ ctx[13]("rollback") + "";
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			attr_dev(bt, "data-tooltip", "Roll to the previous list");
    			attr_dev(bt, "gesture", "Swipe up");
    			attr_dev(bt, "hotkey", "Backspace");
    			attr_dev(bt, "class", "svelte-9l3r24");
    			add_location(bt, file$y, 283, 4, 10630);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);
    			bt.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = [
    					listen_dev(bt, "click", /*click_handler_9*/ ctx[35], false, false, false),
    					action_destroyer(tooltip.call(null, bt))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$3.name,
    		type: "if",
    		source: "(283:2) {#if $matrix}",
    		ctx
    	});

    	return block;
    }

    // (315:6) {#if $state.edit}
    function create_if_block_6$3(ctx) {
    	let bt0;
    	let span0;
    	let t1;
    	let bt1;
    	let span1;
    	let t3;
    	let bt2;
    	let span2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			bt0 = element("bt");
    			span0 = element("span");
    			span0.textContent = "Copy edit link";
    			t1 = space();
    			bt1 = element("bt");
    			span1 = element("span");
    			span1.textContent = "Copy API link";
    			t3 = space();
    			bt2 = element("bt");
    			span2 = element("span");
    			span2.textContent = "Copy COA string";
    			add_location(span0, file$y, 316, 10, 12019);
    			attr_dev(bt0, "data-tooltip", "Copy link to the coat of arms in Edit mode to your clipbard");
    			attr_dev(bt0, "class", "svelte-9l3r24");
    			add_location(bt0, file$y, 315, 8, 11892);
    			add_location(span1, file$y, 320, 10, 12228);
    			attr_dev(bt1, "data-tooltip", "Copy link to the coat of arms for embedding. Armoria API does not support custom charges");
    			attr_dev(bt1, "class", "svelte-9l3r24");
    			add_location(bt1, file$y, 319, 8, 12073);
    			add_location(span2, file$y, 328, 10, 12490);
    			attr_dev(bt2, "data-tooltip", "Copy coa object as encoded string to use in Armoria API or in Watabou's Medieval Fantasy City Generator");
    			attr_dev(bt2, "class", "svelte-9l3r24");
    			add_location(bt2, file$y, 323, 8, 12281);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt0, anchor);
    			append_dev(bt0, span0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, bt1, anchor);
    			append_dev(bt1, span1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, bt2, anchor);
    			append_dev(bt2, span2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(bt0, "click", /*copyEditLink*/ ctx[16], false, false, false),
    					action_destroyer(tooltip.call(null, bt0)),
    					listen_dev(bt1, "click", /*copyAPILink*/ ctx[17], false, false, false),
    					action_destroyer(tooltip.call(null, bt1)),
    					listen_dev(bt2, "click", /*copyCOA*/ ctx[18], false, false, false),
    					action_destroyer(tooltip.call(null, bt2))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(bt1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(bt2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$3.name,
    		type: "if",
    		source: "(315:6) {#if $state.edit}",
    		ctx
    	});

    	return block;
    }

    // (348:2) {#if installable}
    function create_if_block_5$3(ctx) {
    	let bt;
    	let raw_value = /*getIcon*/ ctx[13]("install") + "";
    	let bt_intro;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			attr_dev(bt, "class", "flutter svelte-9l3r24");
    			attr_dev(bt, "data-tooltip", "Add Armoria application to the desktop or home screen");
    			add_location(bt, file$y, 348, 4, 13132);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);
    			bt.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = [
    					listen_dev(bt, "click", /*click_handler_16*/ ctx[42], false, false, false),
    					action_destroyer(tooltip.call(null, bt))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!bt_intro) {
    				add_render_callback(() => {
    					bt_intro = create_in_transition(bt, fade, {});
    					bt_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$3.name,
    		type: "if",
    		source: "(348:2) {#if installable}",
    		ctx
    	});

    	return block;
    }

    // (354:2) {#if $state.edit}
    function create_if_block_2$6(ctx) {
    	let t;
    	let show_if;
    	let if_block1_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*position*/ ctx[5] > 0) return create_if_block_4$3;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (show_if == null || dirty[0] & /*position*/ 32) show_if = !!(/*position*/ ctx[5] < changes.length() - 1);
    		if (show_if) return create_if_block_3$3;
    		return create_else_block$7;
    	}

    	let current_block_type_1 = select_block_type_2(ctx, [-1, -1, -1]);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx, dirty)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$6.name,
    		type: "if",
    		source: "(354:2) {#if $state.edit}",
    		ctx
    	});

    	return block;
    }

    // (359:4) {:else}
    function create_else_block_1$1(ctx) {
    	let bd;
    	let raw_value = /*getIcon*/ ctx[13]("undo", "inactive") + "";

    	const block = {
    		c: function create() {
    			bd = element("bd");
    			attr_dev(bd, "class", "svelte-9l3r24");
    			add_location(bd, file$y, 359, 6, 13564);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bd, anchor);
    			bd.innerHTML = raw_value;
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bd);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(359:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (355:4) {#if position > 0}
    function create_if_block_4$3(ctx) {
    	let bt;
    	let raw_value = /*getIcon*/ ctx[13]("undo") + "";
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			attr_dev(bt, "data-tooltip", "Revert the latest change");
    			attr_dev(bt, "gesture", "Swipe left");
    			attr_dev(bt, "hotkey", "Z");
    			attr_dev(bt, "class", "svelte-9l3r24");
    			add_location(bt, file$y, 355, 6, 13377);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);
    			bt.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = [
    					listen_dev(bt, "click", /*click_handler_17*/ ctx[43], false, false, false),
    					action_destroyer(tooltip.call(null, bt))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$3.name,
    		type: "if",
    		source: "(355:4) {#if position > 0}",
    		ctx
    	});

    	return block;
    }

    // (367:4) {:else}
    function create_else_block$7(ctx) {
    	let bd;
    	let raw_value = /*getIcon*/ ctx[13]("redo", "inactive") + "";

    	const block = {
    		c: function create() {
    			bd = element("bd");
    			attr_dev(bd, "class", "svelte-9l3r24");
    			add_location(bd, file$y, 367, 6, 13859);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bd, anchor);
    			bd.innerHTML = raw_value;
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bd);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(367:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (363:4) {#if position < changes.length() - 1}
    function create_if_block_3$3(ctx) {
    	let bt;
    	let raw_value = /*getIcon*/ ctx[13]("redo") + "";
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			attr_dev(bt, "data-tooltip", "Restore the next change");
    			attr_dev(bt, "gesture", "Swipe right");
    			attr_dev(bt, "hotkey", "X");
    			attr_dev(bt, "class", "svelte-9l3r24");
    			add_location(bt, file$y, 363, 6, 13672);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);
    			bt.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = [
    					listen_dev(bt, "click", /*click_handler_18*/ ctx[44], false, false, false),
    					action_destroyer(tooltip.call(null, bt))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(363:4) {#if position < changes.length() - 1}",
    		ctx
    	});

    	return block;
    }

    // (372:2) {#if $state.edit}
    function create_if_block_1$8(ctx) {
    	let bt;
    	let raw_value = /*getIcon*/ ctx[13]("back") + "";
    	let bt_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			attr_dev(bt, "id", "back");
    			attr_dev(bt, "data-tooltip", "Get back to Gallery");
    			attr_dev(bt, "hotkey", "Escape");
    			attr_dev(bt, "class", "svelte-9l3r24");
    			add_location(bt, file$y, 372, 4, 13952);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);
    			bt.innerHTML = raw_value;
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(bt, "click", /*click_handler_19*/ ctx[45], false, false, false),
    					action_destroyer(tooltip.call(null, bt))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!bt_transition) bt_transition = create_bidirectional_transition(bt, fade, {}, true);
    				bt_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!bt_transition) bt_transition = create_bidirectional_transition(bt, fade, {}, false);
    			bt_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt);
    			if (detaching && bt_transition) bt_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(372:2) {#if $state.edit}",
    		ctx
    	});

    	return block;
    }

    // (378:2) {#if wideScreen || !$state.edit}
    function create_if_block$f(ctx) {
    	let bt0;
    	let raw0_value = /*getIcon*/ ctx[13]("license") + "";
    	let t0;
    	let bt1;
    	let raw1_value = /*getIcon*/ ctx[13]("about") + "";
    	let t1;
    	let bt2;
    	let raw2_value = /*getIcon*/ ctx[13]("support") + "";
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			bt0 = element("bt");
    			t0 = space();
    			bt1 = element("bt");
    			t1 = space();
    			bt2 = element("bt");
    			attr_dev(bt0, "data-tooltip", "Show information about license");
    			attr_dev(bt0, "class", "svelte-9l3r24");
    			add_location(bt0, file$y, 378, 4, 14175);
    			attr_dev(bt1, "data-tooltip", "Show about screen");
    			attr_dev(bt1, "hotkey", "F1");
    			attr_dev(bt1, "class", "svelte-9l3r24");
    			add_location(bt1, file$y, 381, 4, 14326);
    			attr_dev(bt2, "data-tooltip", "Support the project on Patreon");
    			attr_dev(bt2, "class", "svelte-9l3r24");
    			add_location(bt2, file$y, 384, 4, 14472);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt0, anchor);
    			bt0.innerHTML = raw0_value;
    			insert_dev(target, t0, anchor);
    			insert_dev(target, bt1, anchor);
    			bt1.innerHTML = raw1_value;
    			insert_dev(target, t1, anchor);
    			insert_dev(target, bt2, anchor);
    			bt2.innerHTML = raw2_value;

    			if (!mounted) {
    				dispose = [
    					listen_dev(bt0, "click", /*click_handler_20*/ ctx[46], false, false, false),
    					action_destroyer(tooltip.call(null, bt0)),
    					listen_dev(bt1, "click", /*click_handler_21*/ ctx[47], false, false, false),
    					action_destroyer(tooltip.call(null, bt1)),
    					listen_dev(bt2, "click", /*click_handler_22*/ ctx[48], false, false, false),
    					action_destroyer(tooltip.call(null, bt2))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(bt1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(bt2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$f.name,
    		type: "if",
    		source: "(378:2) {#if wideScreen || !$state.edit}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$y(ctx) {
    	let nav;
    	let svg0;
    	let path;
    	let t0;
    	let div15;
    	let bl0;
    	let raw0_value = /*getIcon*/ ctx[13]("options") + "";
    	let t1;
    	let div14;
    	let div1;
    	let div0;
    	let t2;
    	let bl1;
    	let previous_key = /*$shield*/ ctx[6];
    	let t3;
    	let span0;
    	let t5;
    	let bt0;
    	let lock0;
    	let t6;
    	let lock1;
    	let t7;
    	let span1;
    	let t9;
    	let div3;
    	let div2;
    	let t10;
    	let bl2;
    	let previous_key_1 = /*$grad*/ ctx[8];
    	let t11;
    	let span2;
    	let t13;
    	let div5;
    	let div4;
    	let t14;
    	let bl3;
    	let previous_key_2 = /*$diaper*/ ctx[9];
    	let t15;
    	let span3;
    	let t17;
    	let div7;
    	let div6;
    	let t18;
    	let bl4;
    	let previous_key_3 = /*$size*/ ctx[10];
    	let t19;
    	let span4;
    	let t21;
    	let div9;
    	let div8;
    	let bl5;
    	let t22;
    	let t23;
    	let input0;
    	let t24;
    	let bl6;
    	let t25;
    	let t26;
    	let input1;
    	let t27;
    	let bl7;
    	let span5;
    	let t29;
    	let div11;
    	let div10;
    	let bl8;
    	let t30;
    	let svg1;
    	let use;
    	let t31;
    	let t32;
    	let input2;
    	let t33;
    	let bl9;
    	let span6;
    	let t35;
    	let div13;
    	let div12;
    	let bl10;
    	let input3;
    	let t36;
    	let input4;
    	let t37;
    	let bl11;
    	let span7;
    	let t39;
    	let t40;
    	let t41;
    	let bt1;
    	let raw1_value = /*getIcon*/ ctx[13]("reroll") + "";
    	let t42;
    	let div17;
    	let bl12;
    	let raw2_value = /*getIcon*/ ctx[13]("save") + "";
    	let t43;
    	let div16;
    	let bt2;
    	let span8;
    	let t45;
    	let bt3;
    	let span9;
    	let t47;
    	let bt4;
    	let span10;
    	let t49;
    	let t50;
    	let div19;
    	let bl13;
    	let raw3_value = /*getIcon*/ ctx[13]("upload") + "";
    	let t51;
    	let div18;
    	let bt5;
    	let span11;
    	let t53;
    	let bt6;
    	let span12;
    	let t55;
    	let t56;
    	let t57;
    	let t58;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_3 = Object.keys(shields.types);
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	let key_block0 = create_key_block_3(ctx);

    	lock0 = new Lock({
    			props: { key: "tinctures" },
    			$$inline: true
    		});

    	lock1 = new Lock({ props: { key: "colors" }, $$inline: true });
    	let each_value_2 = gradients;
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let key_block1 = create_key_block_2(ctx);
    	let each_value_1 = diapers;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	let key_block2 = create_key_block_1(ctx);
    	let each_value = sizes;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$g(get_each_context$g(ctx, each_value, i));
    	}

    	let key_block3 = create_key_block$2(ctx);
    	let if_block0 = /*$border*/ ctx[2] !== "#333333" && create_if_block_11$2(ctx);
    	let if_block1 = /*$borderWidth*/ ctx[1] !== 1 && create_if_block_10$2(ctx);
    	let if_block2 = /*$background*/ ctx[3] !== "#333333" && create_if_block_9$2(ctx);
    	let if_block3 = !/*wideScreen*/ ctx[12] && /*$state*/ ctx[7].edit && create_if_block_8$2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*$matrix*/ ctx[11]) return create_if_block_7$3;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block4 = current_block_type(ctx);
    	let if_block5 = /*$state*/ ctx[7].edit && create_if_block_6$3(ctx);
    	let if_block6 = /*installable*/ ctx[4] && create_if_block_5$3(ctx);
    	let if_block7 = /*$state*/ ctx[7].edit && create_if_block_2$6(ctx);
    	let if_block8 = /*$state*/ ctx[7].edit && create_if_block_1$8(ctx);
    	let if_block9 = (/*wideScreen*/ ctx[12] || !/*$state*/ ctx[7].edit) && create_if_block$f(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			svg0 = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			div15 = element("div");
    			bl0 = element("bl");
    			t1 = space();
    			div14 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t2 = space();
    			bl1 = element("bl");
    			key_block0.c();
    			t3 = space();
    			span0 = element("span");
    			span0.textContent = "Shield";
    			t5 = space();
    			bt0 = element("bt");
    			create_component(lock0.$$.fragment);
    			t6 = space();
    			create_component(lock1.$$.fragment);
    			t7 = space();
    			span1 = element("span");
    			span1.textContent = "Tinctures";
    			t9 = space();
    			div3 = element("div");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t10 = space();
    			bl2 = element("bl");
    			key_block1.c();
    			t11 = space();
    			span2 = element("span");
    			span2.textContent = "Gradient";
    			t13 = space();
    			div5 = element("div");
    			div4 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t14 = space();
    			bl3 = element("bl");
    			key_block2.c();
    			t15 = space();
    			span3 = element("span");
    			span3.textContent = "Damasking";
    			t17 = space();
    			div7 = element("div");
    			div6 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t18 = space();
    			bl4 = element("bl");
    			key_block3.c();
    			t19 = space();
    			span4 = element("span");
    			span4.textContent = "Gallery";
    			t21 = space();
    			div9 = element("div");
    			div8 = element("div");
    			bl5 = element("bl");
    			t22 = text("Color\r\n            ");
    			if (if_block0) if_block0.c();
    			t23 = space();
    			input0 = element("input");
    			t24 = space();
    			bl6 = element("bl");
    			t25 = text("Width\r\n            ");
    			if (if_block1) if_block1.c();
    			t26 = space();
    			input1 = element("input");
    			t27 = space();
    			bl7 = element("bl");
    			span5 = element("span");
    			span5.textContent = "Border";
    			t29 = space();
    			div11 = element("div");
    			div10 = element("div");
    			bl8 = element("bl");
    			t30 = text("Color\r\n            ");
    			svg1 = svg_element("svg");
    			use = svg_element("use");
    			t31 = space();
    			if (if_block2) if_block2.c();
    			t32 = space();
    			input2 = element("input");
    			t33 = space();
    			bl9 = element("bl");
    			span6 = element("span");
    			span6.textContent = "Background";
    			t35 = space();
    			div13 = element("div");
    			div12 = element("div");
    			bl10 = element("bl");
    			input3 = element("input");
    			t36 = space();
    			input4 = element("input");
    			t37 = space();
    			bl11 = element("bl");
    			span7 = element("span");
    			span7.textContent = "Scale";
    			t39 = space();
    			if (if_block3) if_block3.c();
    			t40 = space();
    			if_block4.c();
    			t41 = space();
    			bt1 = element("bt");
    			t42 = space();
    			div17 = element("div");
    			bl12 = element("bl");
    			t43 = space();
    			div16 = element("div");
    			bt2 = element("bt");
    			span8 = element("span");
    			span8.textContent = "Download SVG";
    			t45 = space();
    			bt3 = element("bt");
    			span9 = element("span");
    			span9.textContent = "Download PNG";
    			t47 = space();
    			bt4 = element("bt");
    			span10 = element("span");
    			span10.textContent = "Download JPEG";
    			t49 = space();
    			if (if_block5) if_block5.c();
    			t50 = space();
    			div19 = element("div");
    			bl13 = element("bl");
    			t51 = space();
    			div18 = element("div");
    			bt5 = element("bt");
    			span11 = element("span");
    			span11.textContent = "Raster charge";
    			t53 = space();
    			bt6 = element("bt");
    			span12 = element("span");
    			span12.textContent = "Vector charge";
    			t55 = space();
    			if (if_block6) if_block6.c();
    			t56 = space();
    			if (if_block7) if_block7.c();
    			t57 = space();
    			if (if_block8) if_block8.c();
    			t58 = space();
    			if (if_block9) if_block9.c();
    			attr_dev(path, "fill", "#fff");
    			attr_dev(path, "stroke", "none");
    			attr_dev(path, "d", "m 46,3 0.6,1.4 c -1.5,0.7 -2.6,1.4 -3.3,2.2 -0.7,0.7 -1.2,1.5 -1.5,2.4 -0.3,0.9 -0.4,2.2 -0.4,3.9 0,0.6 0,1.3 0,2.2 l 0.5,23.2 c 0,2.5 0.3,4.2 0.8,5 0.4,0.6 0.8,0.8 1.3,0.8 0.6,0 1.5,-0.6 2.8,-1.8 l 0.9,1.1 -5.8,4.9 -1.9,1.6 C 38.4,49.2 37.2,48.2 36.5,46.9 35.8,45.7 35.3,36.7 35.2,34 c -7.6,0.1 -20.2,0 -20.2,0 0,0 -7.4,9.1 -7.4,11.1 0,0.6 0.2,1.1 0.6,1.8 0.5,0.9 0.8,1.4 0.8,1.7 0,0.4 -0.1,0.7 -0.4,1 -0.3,0.3 -0.6,0.4 -1.1,0.4 -0.5,0 -0.9,-0.2 -1.2,-0.6 -0.5,-0.6 -0.7,-1.3 -0.7,-2.2 0,-1 0.3,-2.1 0.8,-3.3 C 8.8,39.9 11.3,36.7 14.1,32.9 11.1,30.7 9,28.5 7.8,26.4 6.6,24.4 6,22.1 6,19.5 c 0,-3 0.8,-5.7 2.3,-8.3 1.5,-2.5 3.8,-4.5 6.9,-6 3.1,-1.5 6.2,-2.2 9.4,-2.2 4.9,0 9.7,1.7 14.3,5.1 1.1,-1.2 2.2,-2.1 3.2,-2.9 1,-0.8 2.4,-1.5 4,-2.3 z M 30.7,10.2 c -2.6,-1.3 -5.2,-1.9 -7.8,-1.9 -2.7,0 -5.3,0.6 -7.8,1.8 -2.4,1.2 -4.2,2.8 -5.4,4.7 -1.2,1.9 -1.8,3.9 -1.8,5.9 0,4.2 2.3,8 6.9,11.3 L 25.2,17.7 c -1.6,-0.8 -2.9,-1.3 -4.2,-1.3 -1.7,0 -3.1,0.8 -4.2,2.4 -0.4,0.7 -1,0.5 -1.1,-0.2 0,-0.6 0.3,-1.5 1,-2.7 0.7,-1.1 1.6,-2.1 2.9,-2.8 1.3,-0.7 2.6,-1.1 4,-1.1 1.4,0 3.1,0.4 4.9,1.1 z m 4,3.2 C 34,12.4 32.8,11.5 32,11 L 18.4,29.4 h 16.7 z");
    			add_location(path, file$y, 113, 4, 3607);
    			attr_dev(svg0, "class", "logo svelte-9l3r24");
    			attr_dev(svg0, "width", "35");
    			attr_dev(svg0, "height", "35");
    			attr_dev(svg0, "viewBox", "-2 -1 55 55");
    			add_location(svg0, file$y, 112, 2, 3520);
    			attr_dev(bl0, "class", "svelte-9l3r24");
    			add_location(bl0, file$y, 121, 4, 4851);
    			attr_dev(div0, "class", "dropdown level2 svelte-9l3r24");
    			add_location(div0, file$y, 125, 8, 4964);
    			add_location(span0, file$y, 147, 10, 5920);
    			attr_dev(bl1, "data-tooltip", "Shield or banner shape. If not set, a random one is selected on reroll");
    			attr_dev(bl1, "class", "svelte-9l3r24");
    			add_location(bl1, file$y, 145, 8, 5753);
    			attr_dev(div1, "class", "container svelte-9l3r24");
    			add_location(div1, file$y, 124, 6, 4931);
    			add_location(span1, file$y, 154, 8, 6165);
    			attr_dev(bt0, "data-tooltip", "Setup tinctures selection chance and hue");
    			attr_dev(bt0, "class", "svelte-9l3r24");
    			add_location(bt0, file$y, 151, 6, 5978);
    			attr_dev(div2, "class", "dropdown level2 svelte-9l3r24");
    			add_location(div2, file$y, 158, 8, 6243);
    			add_location(span2, file$y, 165, 10, 6592);
    			attr_dev(bl2, "data-tooltip", "Overlay style to be applied on top of coat of arms");
    			attr_dev(bl2, "class", "svelte-9l3r24");
    			add_location(bl2, file$y, 163, 8, 6449);
    			attr_dev(div3, "class", "container svelte-9l3r24");
    			add_location(div3, file$y, 157, 6, 6210);
    			attr_dev(div4, "class", "dropdown level2 svelte-9l3r24");
    			add_location(div4, file$y, 170, 8, 6685);
    			add_location(span3, file$y, 177, 10, 7044);
    			attr_dev(bl3, "data-tooltip", "Backing style for coat of arms, also known as diaper");
    			attr_dev(bl3, "class", "svelte-9l3r24");
    			add_location(bl3, file$y, 175, 8, 6895);
    			attr_dev(div5, "class", "container svelte-9l3r24");
    			add_location(div5, file$y, 169, 6, 6652);
    			attr_dev(div6, "class", "dropdown level2 svelte-9l3r24");
    			add_location(div6, file$y, 182, 8, 7138);
    			add_location(span4, file$y, 189, 10, 7519);
    			attr_dev(bl4, "data-tooltip", "Coat of arms gallery size. Change to smaller value to make coat of arms bigger");
    			attr_dev(bl4, "class", "svelte-9l3r24");
    			add_location(bl4, file$y, 187, 8, 7348);
    			attr_dev(div7, "class", "container svelte-9l3r24");
    			add_location(div7, file$y, 181, 6, 7105);
    			attr_dev(input0, "type", "color");
    			attr_dev(input0, "class", "svelte-9l3r24");
    			add_location(input0, file$y, 207, 12, 8065);
    			attr_dev(bl5, "class", "svelte-9l3r24");
    			add_location(bl5, file$y, 195, 10, 7652);
    			attr_dev(input1, "class", "right svelte-9l3r24");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "4");
    			attr_dev(input1, "step", ".1");
    			input1.value = /*$borderWidth*/ ctx[1];
    			add_location(input1, file$y, 221, 12, 8564);
    			attr_dev(bl6, "class", "svelte-9l3r24");
    			add_location(bl6, file$y, 209, 10, 8137);
    			attr_dev(div8, "class", "dropdown level2 svelte-9l3r24");
    			add_location(div8, file$y, 194, 8, 7611);
    			add_location(span5, file$y, 235, 10, 8990);
    			attr_dev(bl7, "data-tooltip", "Coat of arms border style");
    			attr_dev(bl7, "class", "svelte-9l3r24");
    			add_location(bl7, file$y, 234, 8, 8921);
    			attr_dev(div9, "class", "container svelte-9l3r24");
    			add_location(div9, file$y, 193, 6, 7578);
    			attr_dev(use, "href", "#random-icon");
    			add_location(use, file$y, 244, 14, 9287);
    			attr_dev(svg1, "class", "navBarIcon active smaller svelte-9l3r24");
    			attr_dev(svg1, "data-tooltip", "Select random color");
    			add_location(svg1, file$y, 243, 12, 9159);
    			attr_dev(input2, "type", "color");
    			attr_dev(input2, "class", "svelte-9l3r24");
    			add_location(input2, file$y, 256, 12, 9736);
    			attr_dev(bl8, "class", "svelte-9l3r24");
    			add_location(bl8, file$y, 241, 10, 9122);
    			attr_dev(div10, "class", "dropdown level2 svelte-9l3r24");
    			add_location(div10, file$y, 240, 8, 9081);
    			add_location(span6, file$y, 260, 10, 9893);
    			attr_dev(bl9, "data-tooltip", "Window background color");
    			attr_dev(bl9, "class", "svelte-9l3r24");
    			add_location(bl9, file$y, 259, 8, 9826);
    			attr_dev(div11, "class", "container svelte-9l3r24");
    			add_location(div11, file$y, 239, 6, 9048);
    			attr_dev(input3, "type", "range");
    			attr_dev(input3, "min", "1");
    			attr_dev(input3, "max", "4");
    			attr_dev(input3, "step", ".1");
    			attr_dev(input3, "class", "svelte-9l3r24");
    			add_location(input3, file$y, 267, 12, 10060);
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "min", "1");
    			attr_dev(input4, "max", "4");
    			attr_dev(input4, "step", ".1");
    			attr_dev(input4, "class", "svelte-9l3r24");
    			add_location(input4, file$y, 268, 12, 10142);
    			attr_dev(bl10, "class", "wide svelte-9l3r24");
    			add_location(bl10, file$y, 266, 10, 10029);
    			attr_dev(div12, "class", "dropdown level2 svelte-9l3r24");
    			add_location(div12, file$y, 265, 8, 9988);
    			add_location(span7, file$y, 272, 10, 10357);
    			attr_dev(bl11, "data-tooltip", "Downloaded image size, 1 is default size, 2 - 2x size, etc.");
    			attr_dev(bl11, "class", "svelte-9l3r24");
    			add_location(bl11, file$y, 271, 8, 10254);
    			attr_dev(div13, "class", "container svelte-9l3r24");
    			add_location(div13, file$y, 264, 6, 9955);
    			attr_dev(div14, "class", "dropdown level1 svelte-9l3r24");
    			add_location(div14, file$y, 123, 4, 4894);
    			attr_dev(div15, "class", "container svelte-9l3r24");
    			add_location(div15, file$y, 120, 2, 4822);
    			attr_dev(bt1, "data-tooltip", "Regenerate coat of arms");
    			attr_dev(bt1, "gesture", "Swipe down");
    			attr_dev(bt1, "hotkey", "Enter");
    			attr_dev(bt1, "class", "svelte-9l3r24");
    			add_location(bt1, file$y, 290, 2, 10883);
    			attr_dev(bl12, "class", "svelte-9l3r24");
    			add_location(bl12, file$y, 295, 4, 11081);
    			add_location(span8, file$y, 303, 8, 11407);
    			attr_dev(bt2, "data-tooltip", "Download vector image or set of images. Open in browser or load to Map Generator. Size can be set in options");
    			attr_dev(bt2, "hotkey", "Ctrl + S");
    			attr_dev(bt2, "class", "svelte-9l3r24");
    			add_location(bt2, file$y, 297, 6, 11156);
    			add_location(span9, file$y, 307, 8, 11606);
    			attr_dev(bt3, "data-tooltip", "Download as raster image. Size can be set in options");
    			attr_dev(bt3, "hotkey", "Ctrl + P");
    			attr_dev(bt3, "class", "svelte-9l3r24");
    			add_location(bt3, file$y, 306, 6, 11455);
    			add_location(span10, file$y, 311, 8, 11816);
    			attr_dev(bt4, "data-tooltip", "Download a compressed raster image. Size can be set in options");
    			attr_dev(bt4, "hotkey", "Ctrl + J");
    			attr_dev(bt4, "class", "svelte-9l3r24");
    			add_location(bt4, file$y, 310, 6, 11654);
    			attr_dev(div16, "class", "dropdown level1 svelte-9l3r24");
    			add_location(div16, file$y, 296, 4, 11119);
    			attr_dev(div17, "class", "container svelte-9l3r24");
    			add_location(div17, file$y, 294, 2, 11052);
    			attr_dev(bl13, "class", "svelte-9l3r24");
    			add_location(bl13, file$y, 335, 4, 12603);
    			add_location(span11, file$y, 338, 8, 12841);
    			attr_dev(bt5, "data-tooltip", "Upload raster charge (one color, quality loss on scale) from jpg, png or svg image");
    			attr_dev(bt5, "class", "svelte-9l3r24");
    			add_location(bt5, file$y, 337, 6, 12680);
    			add_location(span12, file$y, 342, 8, 13042);
    			attr_dev(bt6, "data-tooltip", "Upload vector charge (multicolor and lossless scalable) from prepared svg");
    			attr_dev(bt6, "class", "svelte-9l3r24");
    			add_location(bt6, file$y, 341, 6, 12890);
    			attr_dev(div18, "class", "dropdown level1 svelte-9l3r24");
    			add_location(div18, file$y, 336, 4, 12643);
    			attr_dev(div19, "class", "container svelte-9l3r24");
    			add_location(div19, file$y, 334, 2, 12574);
    			attr_dev(nav, "class", "svelte-9l3r24");
    			add_location(nav, file$y, 111, 0, 3511);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, svg0);
    			append_dev(svg0, path);
    			append_dev(nav, t0);
    			append_dev(nav, div15);
    			append_dev(div15, bl0);
    			bl0.innerHTML = raw0_value;
    			append_dev(div15, t1);
    			append_dev(div15, div14);
    			append_dev(div14, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div0, null);
    			}

    			append_dev(div1, t2);
    			append_dev(div1, bl1);
    			key_block0.m(bl1, null);
    			append_dev(bl1, t3);
    			append_dev(bl1, span0);
    			append_dev(div14, t5);
    			append_dev(div14, bt0);
    			mount_component(lock0, bt0, null);
    			append_dev(bt0, t6);
    			mount_component(lock1, bt0, null);
    			append_dev(bt0, t7);
    			append_dev(bt0, span1);
    			append_dev(div14, t9);
    			append_dev(div14, div3);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div2, null);
    			}

    			append_dev(div3, t10);
    			append_dev(div3, bl2);
    			key_block1.m(bl2, null);
    			append_dev(bl2, t11);
    			append_dev(bl2, span2);
    			append_dev(div14, t13);
    			append_dev(div14, div5);
    			append_dev(div5, div4);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div4, null);
    			}

    			append_dev(div5, t14);
    			append_dev(div5, bl3);
    			key_block2.m(bl3, null);
    			append_dev(bl3, t15);
    			append_dev(bl3, span3);
    			append_dev(div14, t17);
    			append_dev(div14, div7);
    			append_dev(div7, div6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div6, null);
    			}

    			append_dev(div7, t18);
    			append_dev(div7, bl4);
    			key_block3.m(bl4, null);
    			append_dev(bl4, t19);
    			append_dev(bl4, span4);
    			append_dev(div14, t21);
    			append_dev(div14, div9);
    			append_dev(div9, div8);
    			append_dev(div8, bl5);
    			append_dev(bl5, t22);
    			if (if_block0) if_block0.m(bl5, null);
    			append_dev(bl5, t23);
    			append_dev(bl5, input0);
    			set_input_value(input0, /*$border*/ ctx[2]);
    			append_dev(div8, t24);
    			append_dev(div8, bl6);
    			append_dev(bl6, t25);
    			if (if_block1) if_block1.m(bl6, null);
    			append_dev(bl6, t26);
    			append_dev(bl6, input1);
    			append_dev(div9, t27);
    			append_dev(div9, bl7);
    			append_dev(bl7, span5);
    			append_dev(div14, t29);
    			append_dev(div14, div11);
    			append_dev(div11, div10);
    			append_dev(div10, bl8);
    			append_dev(bl8, t30);
    			append_dev(bl8, svg1);
    			append_dev(svg1, use);
    			append_dev(bl8, t31);
    			if (if_block2) if_block2.m(bl8, null);
    			append_dev(bl8, t32);
    			append_dev(bl8, input2);
    			set_input_value(input2, /*$background*/ ctx[3]);
    			append_dev(div11, t33);
    			append_dev(div11, bl9);
    			append_dev(bl9, span6);
    			append_dev(div14, t35);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, bl10);
    			append_dev(bl10, input3);
    			set_input_value(input3, /*$scale*/ ctx[0]);
    			append_dev(bl10, t36);
    			append_dev(bl10, input4);
    			set_input_value(input4, /*$scale*/ ctx[0]);
    			append_dev(div13, t37);
    			append_dev(div13, bl11);
    			append_dev(bl11, span7);
    			append_dev(div14, t39);
    			if (if_block3) if_block3.m(div14, null);
    			append_dev(nav, t40);
    			if_block4.m(nav, null);
    			append_dev(nav, t41);
    			append_dev(nav, bt1);
    			bt1.innerHTML = raw1_value;
    			append_dev(nav, t42);
    			append_dev(nav, div17);
    			append_dev(div17, bl12);
    			bl12.innerHTML = raw2_value;
    			append_dev(div17, t43);
    			append_dev(div17, div16);
    			append_dev(div16, bt2);
    			append_dev(bt2, span8);
    			append_dev(div16, t45);
    			append_dev(div16, bt3);
    			append_dev(bt3, span9);
    			append_dev(div16, t47);
    			append_dev(div16, bt4);
    			append_dev(bt4, span10);
    			append_dev(div16, t49);
    			if (if_block5) if_block5.m(div16, null);
    			append_dev(nav, t50);
    			append_dev(nav, div19);
    			append_dev(div19, bl13);
    			bl13.innerHTML = raw3_value;
    			append_dev(div19, t51);
    			append_dev(div19, div18);
    			append_dev(div18, bt5);
    			append_dev(bt5, span11);
    			append_dev(div18, t53);
    			append_dev(div18, bt6);
    			append_dev(bt6, span12);
    			append_dev(nav, t55);
    			if (if_block6) if_block6.m(nav, null);
    			append_dev(nav, t56);
    			if (if_block7) if_block7.m(nav, null);
    			append_dev(nav, t57);
    			if (if_block8) if_block8.m(nav, null);
    			append_dev(nav, t58);
    			if (if_block9) if_block9.m(nav, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg0, "click", goHome, false, false, false),
    					action_destroyer(tooltip.call(null, bl1)),
    					listen_dev(bt0, "click", /*click_handler_1*/ ctx[22], false, false, false),
    					action_destroyer(tooltip.call(null, bt0)),
    					action_destroyer(tooltip.call(null, bl2)),
    					action_destroyer(tooltip.call(null, bl3)),
    					action_destroyer(tooltip.call(null, bl4)),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[27]),
    					listen_dev(input1, "input", /*input_handler*/ ctx[29], false, false, false),
    					action_destroyer(tooltip.call(null, bl7)),
    					listen_dev(svg1, "click", /*getRandomColor*/ ctx[15], false, false, false),
    					action_destroyer(tooltip.call(null, svg1)),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[31]),
    					action_destroyer(tooltip.call(null, bl9)),
    					listen_dev(input3, "change", /*input3_change_input_handler*/ ctx[32]),
    					listen_dev(input3, "input", /*input3_change_input_handler*/ ctx[32]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[33]),
    					action_destroyer(tooltip.call(null, bl11)),
    					listen_dev(bt1, "click", /*click_handler_10*/ ctx[36], false, false, false),
    					action_destroyer(tooltip.call(null, bt1)),
    					listen_dev(bt2, "click", /*click_handler_11*/ ctx[37], false, false, false),
    					action_destroyer(tooltip.call(null, bt2)),
    					listen_dev(bt3, "click", /*click_handler_12*/ ctx[38], false, false, false),
    					action_destroyer(tooltip.call(null, bt3)),
    					listen_dev(bt4, "click", /*click_handler_13*/ ctx[39], false, false, false),
    					action_destroyer(tooltip.call(null, bt4)),
    					listen_dev(bt5, "click", /*click_handler_14*/ ctx[40], false, false, false),
    					action_destroyer(tooltip.call(null, bt5)),
    					listen_dev(bt6, "click", /*click_handler_15*/ ctx[41], false, false, false),
    					action_destroyer(tooltip.call(null, bt6))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*change, $shield*/ 16448) {
    				each_value_3 = Object.keys(shields.types);
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_3$1(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_3.length;
    			}

    			if (dirty[0] & /*$shield*/ 64 && safe_not_equal(previous_key, previous_key = /*$shield*/ ctx[6])) {
    				group_outros();
    				transition_out(key_block0, 1, 1, noop);
    				check_outros();
    				key_block0 = create_key_block_3(ctx);
    				key_block0.c();
    				transition_in(key_block0);
    				key_block0.m(bl1, t3);
    			} else {
    				key_block0.p(ctx, dirty);
    			}

    			if (dirty[0] & /*$grad, change*/ 16640) {
    				each_value_2 = gradients;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty[0] & /*$grad*/ 256 && safe_not_equal(previous_key_1, previous_key_1 = /*$grad*/ ctx[8])) {
    				group_outros();
    				transition_out(key_block1, 1, 1, noop);
    				check_outros();
    				key_block1 = create_key_block_2(ctx);
    				key_block1.c();
    				transition_in(key_block1);
    				key_block1.m(bl2, t11);
    			} else {
    				key_block1.p(ctx, dirty);
    			}

    			if (dirty[0] & /*$diaper, change*/ 16896) {
    				each_value_1 = diapers;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$4(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*$diaper*/ 512 && safe_not_equal(previous_key_2, previous_key_2 = /*$diaper*/ ctx[9])) {
    				group_outros();
    				transition_out(key_block2, 1, 1, noop);
    				check_outros();
    				key_block2 = create_key_block_1(ctx);
    				key_block2.c();
    				transition_in(key_block2);
    				key_block2.m(bl3, t15);
    			} else {
    				key_block2.p(ctx, dirty);
    			}

    			if (dirty[0] & /*$size, change*/ 17408) {
    				each_value = sizes;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$g(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$g(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div6, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*$size*/ 1024 && safe_not_equal(previous_key_3, previous_key_3 = /*$size*/ ctx[10])) {
    				group_outros();
    				transition_out(key_block3, 1, 1, noop);
    				check_outros();
    				key_block3 = create_key_block$2(ctx);
    				key_block3.c();
    				transition_in(key_block3);
    				key_block3.m(bl4, t19);
    			} else {
    				key_block3.p(ctx, dirty);
    			}

    			if (/*$border*/ ctx[2] !== "#333333") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_11$2(ctx);
    					if_block0.c();
    					if_block0.m(bl5, t23);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*$border*/ 4) {
    				set_input_value(input0, /*$border*/ ctx[2]);
    			}

    			if (/*$borderWidth*/ ctx[1] !== 1) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_10$2(ctx);
    					if_block1.c();
    					if_block1.m(bl6, t26);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty[0] & /*$borderWidth*/ 2) {
    				prop_dev(input1, "value", /*$borderWidth*/ ctx[1]);
    			}

    			if (/*$background*/ ctx[3] !== "#333333") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_9$2(ctx);
    					if_block2.c();
    					if_block2.m(bl8, t32);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*$background*/ 8) {
    				set_input_value(input2, /*$background*/ ctx[3]);
    			}

    			if (dirty[0] & /*$scale*/ 1) {
    				set_input_value(input3, /*$scale*/ ctx[0]);
    			}

    			if (dirty[0] & /*$scale*/ 1 && to_number(input4.value) !== /*$scale*/ ctx[0]) {
    				set_input_value(input4, /*$scale*/ ctx[0]);
    			}

    			if (!/*wideScreen*/ ctx[12] && /*$state*/ ctx[7].edit) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_8$2(ctx);
    					if_block3.c();
    					if_block3.m(div14, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block4) {
    				if_block4.p(ctx, dirty);
    			} else {
    				if_block4.d(1);
    				if_block4 = current_block_type(ctx);

    				if (if_block4) {
    					if_block4.c();
    					if_block4.m(nav, t41);
    				}
    			}

    			if (/*$state*/ ctx[7].edit) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_6$3(ctx);
    					if_block5.c();
    					if_block5.m(div16, null);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*installable*/ ctx[4]) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);

    					if (dirty[0] & /*installable*/ 16) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_5$3(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(nav, t56);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*$state*/ ctx[7].edit) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_2$6(ctx);
    					if_block7.c();
    					if_block7.m(nav, t57);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*$state*/ ctx[7].edit) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);

    					if (dirty[0] & /*$state*/ 128) {
    						transition_in(if_block8, 1);
    					}
    				} else {
    					if_block8 = create_if_block_1$8(ctx);
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(nav, t58);
    				}
    			} else if (if_block8) {
    				group_outros();

    				transition_out(if_block8, 1, 1, () => {
    					if_block8 = null;
    				});

    				check_outros();
    			}

    			if (/*wideScreen*/ ctx[12] || !/*$state*/ ctx[7].edit) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block$f(ctx);
    					if_block9.c();
    					if_block9.m(nav, null);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block0);
    			transition_in(lock0.$$.fragment, local);
    			transition_in(lock1.$$.fragment, local);
    			transition_in(key_block1);
    			transition_in(key_block2);
    			transition_in(key_block3);
    			transition_in(if_block6);
    			transition_in(if_block8);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block0);
    			transition_out(lock0.$$.fragment, local);
    			transition_out(lock1.$$.fragment, local);
    			transition_out(key_block1);
    			transition_out(key_block2);
    			transition_out(key_block3);
    			transition_out(if_block8);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks_3, detaching);
    			key_block0.d(detaching);
    			destroy_component(lock0);
    			destroy_component(lock1);
    			destroy_each(each_blocks_2, detaching);
    			key_block1.d(detaching);
    			destroy_each(each_blocks_1, detaching);
    			key_block2.d(detaching);
    			destroy_each(each_blocks, detaching);
    			key_block3.d(detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function restoreDefault(e, store, key, value) {
    	e.stopPropagation();
    	store.set(value);
    	localStorage.removeItem(key);
    }

    function goHome() {
    	location.href = location.origin + location.pathname;
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let position;
    	let $scale;
    	let $borderWidth;
    	let $border;
    	let $background;
    	let $message;
    	let $changes;
    	let $shield;
    	let $state;
    	let $grad;
    	let $diaper;
    	let $size;
    	let $matrix;
    	validate_store(scale, 'scale');
    	component_subscribe($$self, scale, $$value => $$invalidate(0, $scale = $$value));
    	validate_store(borderWidth, 'borderWidth');
    	component_subscribe($$self, borderWidth, $$value => $$invalidate(1, $borderWidth = $$value));
    	validate_store(border, 'border');
    	component_subscribe($$self, border, $$value => $$invalidate(2, $border = $$value));
    	validate_store(background, 'background');
    	component_subscribe($$self, background, $$value => $$invalidate(3, $background = $$value));
    	validate_store(message, 'message');
    	component_subscribe($$self, message, $$value => $$invalidate(50, $message = $$value));
    	validate_store(changes, 'changes');
    	component_subscribe($$self, changes, $$value => $$invalidate(20, $changes = $$value));
    	validate_store(shield, 'shield');
    	component_subscribe($$self, shield, $$value => $$invalidate(6, $shield = $$value));
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(7, $state = $$value));
    	validate_store(grad, 'grad');
    	component_subscribe($$self, grad, $$value => $$invalidate(8, $grad = $$value));
    	validate_store(diaper, 'diaper');
    	component_subscribe($$self, diaper, $$value => $$invalidate(9, $diaper = $$value));
    	validate_store(size, 'size');
    	component_subscribe($$self, size, $$value => $$invalidate(10, $size = $$value));
    	validate_store(matrix, 'matrix');
    	component_subscribe($$self, matrix, $$value => $$invalidate(11, $matrix = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	let installable = false;
    	let prompt = null;
    	const wideScreen = window.innerWidth > 600;

    	function getIcon(icon, active = "active") {
    		if (wideScreen) return `<span class="navBarIcon ${active}">${icon}</span>`;
    		return `<svg class="navBarIcon ${active}"><use href="#${icon}-icon"></use></svg>`;
    	}

    	function change(e, store, value, key) {
    		e.stopPropagation();
    		store.set(value);
    		localStorage.setItem(key, value);

    		// update coa on shield change
    		if (key === "shield" && changes.length()) {
    			const coa = JSON.parse($changes[0]);
    			coa.shield = $shield;
    			changes.add(JSON.stringify(coa));
    		}
    	}

    	function getRandomColor() {
    		const l = "0123456789ABCDEF";
    		set_store_value(background, $background = "#" + [0, 0, 0, 0, 0, 0].map(() => l[Math.floor(Math.random() * 16)]).join(""), $background);
    		localStorage.setItem("background", $background);
    	}

    	function copyEditLink() {
    		const coa = $changes[0].replaceAll("#", "%23");
    		const url = location.origin + location.pathname + "?coa=" + coa;
    		copyToClipboard(url, "Coat of arms link is copied to your clipboard");
    	}

    	function copyAPILink() {
    		const encoded = encodeURI($changes[0]);
    		const API = "https://armoria.herokuapp.com/";
    		const url = `${API}?size=500&format=png&coa=${encoded}`;
    		copyToClipboard(url, "API link is copied to your clipboard");
    	}

    	function copyCOA() {
    		const encoded = encodeURI($changes[0]);
    		copyToClipboard(encoded, "Encoded COA string is copied to your clipboard");
    	}

    	function copyToClipboard(stringToCopy, response) {
    		set_store_value(message, $message = null, $message);

    		navigator.clipboard.writeText(stringToCopy).then(
    			() => {
    				set_store_value(message, $message = null, $message);

    				setTimeout(
    					() => {
    						set_store_value(
    							message,
    							$message = {
    								type: "success",
    								text: response,
    								timeout: 5000
    							},
    							$message
    						);
    					},
    					500
    				);
    			},
    			err => {
    				const text = "Cannot copy to the clipboard!";
    				set_store_value(message, $message = { type: "error", text, timeout: 5000 }, $message);
    				console.error(err);
    			}
    		);
    	}

    	function install() {
    		$$invalidate(4, installable = false);
    		prompt.prompt();
    		prompt.userChoice.then(choise => prompt = null);
    	}

    	window.addEventListener("beforeinstallprompt", e => {
    		console.log("beforeinstallprompt is fired");

    		//e.preventDefault(); // no default prompt
    		prompt = e;

    		$$invalidate(4, installable = true);
    	});

    	window.addEventListener("appinstalled", e => {
    		console.log("App installation: success");

    		set_store_value(
    			message,
    			$message = {
    				type: "success",
    				text: `Armoria application is installed`,
    				timeout: 5000
    			},
    			$message
    		);
    	});

    	const writable_props = [];

    	Object_1$b.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (sh, e) => change(e, shield, sh, "shield");
    	const click_handler_1 = () => set_store_value(state, $state.tinctures = 1, $state);
    	const click_handler_2 = (g, e) => change(e, grad, g, "grad");
    	const click_handler_3 = (d, e) => change(e, diaper, d, "diaper");
    	const click_handler_4 = (s, e) => change(e, size, s[0], "size");
    	const click_handler_5 = e => restoreDefault(e, border, "border", "#333333");

    	function input0_input_handler() {
    		$border = this.value;
    		border.set($border);
    	}

    	const click_handler_6 = e => restoreDefault(e, borderWidth, "borderWidth", "#333333");

    	const input_handler = function (e) {
    		change(e, borderWidth, +this.value, "borderWidth");
    	};

    	const click_handler_7 = e => restoreDefault(e, background, "background", "#333333");

    	function input2_input_handler() {
    		$background = this.value;
    		background.set($background);
    	}

    	function input3_change_input_handler() {
    		$scale = to_number(this.value);
    		scale.set($scale);
    	}

    	function input4_input_handler() {
    		$scale = to_number(this.value);
    		scale.set($scale);
    	}

    	const click_handler_8 = () => set_store_value(state, $state.license = 1, $state);
    	const click_handler_9 = () => set_store_value(matrix, $matrix -= 1, $matrix);
    	const click_handler_10 = () => set_store_value(matrix, $matrix += 1, $matrix);
    	const click_handler_11 = () => download(null, "svg");
    	const click_handler_12 = () => download(null, "png");
    	const click_handler_13 = () => download(null, "jpeg");
    	const click_handler_14 = () => set_store_value(state, $state.raster = 1, $state);
    	const click_handler_15 = () => set_store_value(state, $state.vector = 1, $state);
    	const click_handler_16 = () => install();
    	const click_handler_17 = () => changes.undo();
    	const click_handler_18 = () => changes.redo();
    	const click_handler_19 = () => set_store_value(state, $state.edit = 0, $state);
    	const click_handler_20 = () => set_store_value(state, $state.license = 1, $state);
    	const click_handler_21 = () => set_store_value(state, $state.about = 1, $state);
    	const click_handler_22 = () => window.open("https://www.patreon.com/azgaar", "_blank");

    	$$self.$capture_state = () => ({
    		Lock,
    		fade,
    		download,
    		sizes,
    		gradients,
    		diapers,
    		size,
    		grad,
    		diaper,
    		shield,
    		background,
    		scale,
    		border,
    		borderWidth,
    		matrix,
    		state,
    		changes,
    		message,
    		shields,
    		shieldPaths,
    		tooltip,
    		installable,
    		prompt,
    		wideScreen,
    		getIcon,
    		change,
    		getRandomColor,
    		restoreDefault,
    		goHome,
    		copyEditLink,
    		copyAPILink,
    		copyCOA,
    		copyToClipboard,
    		install,
    		position,
    		$scale,
    		$borderWidth,
    		$border,
    		$background,
    		$message,
    		$changes,
    		$shield,
    		$state,
    		$grad,
    		$diaper,
    		$size,
    		$matrix
    	});

    	$$self.$inject_state = $$props => {
    		if ('installable' in $$props) $$invalidate(4, installable = $$props.installable);
    		if ('prompt' in $$props) prompt = $$props.prompt;
    		if ('position' in $$props) $$invalidate(5, position = $$props.position);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$changes*/ 1048576) {
    			$$invalidate(5, position = $changes[1]);
    		}

    		if ($$self.$$.dirty[0] & /*$background*/ 8) {
    			// values to be always saved
    			localStorage.setItem("background", $background);
    		}

    		if ($$self.$$.dirty[0] & /*$border*/ 4) {
    			localStorage.setItem("border", $border);
    		}

    		if ($$self.$$.dirty[0] & /*$borderWidth*/ 2) {
    			localStorage.setItem("borderWidth", $borderWidth);
    		}

    		if ($$self.$$.dirty[0] & /*$scale*/ 1) {
    			localStorage.setItem("scale", $scale);
    		}
    	};

    	return [
    		$scale,
    		$borderWidth,
    		$border,
    		$background,
    		installable,
    		position,
    		$shield,
    		$state,
    		$grad,
    		$diaper,
    		$size,
    		$matrix,
    		wideScreen,
    		getIcon,
    		change,
    		getRandomColor,
    		copyEditLink,
    		copyAPILink,
    		copyCOA,
    		install,
    		$changes,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		input0_input_handler,
    		click_handler_6,
    		input_handler,
    		click_handler_7,
    		input2_input_handler,
    		input3_change_input_handler,
    		input4_input_handler,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10,
    		click_handler_11,
    		click_handler_12,
    		click_handler_13,
    		click_handler_14,
    		click_handler_15,
    		click_handler_16,
    		click_handler_17,
    		click_handler_18,
    		click_handler_19,
    		click_handler_20,
    		click_handler_21,
    		click_handler_22
    	];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {}, null, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$y.name
    		});
    	}
    }

    /* src\components\navigation\AnimatedCOA.svelte generated by Svelte v3.44.2 */
    const file$x = "src\\components\\navigation\\AnimatedCOA.svelte";

    function create_fragment$x(ctx) {
    	let svg;
    	let clipPath;
    	let path0;
    	let g1;
    	let path1;
    	let path1_intro;
    	let path2;
    	let path2_intro;
    	let g0;
    	let rect0;
    	let rect0_fill_value;
    	let path3;
    	let path3_fill_value;
    	let rect1;
    	let g0_intro;
    	let g2;
    	let path4;
    	let path4_intro;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			clipPath = svg_element("clipPath");
    			path0 = svg_element("path");
    			g1 = svg_element("g");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			g0 = svg_element("g");
    			rect0 = svg_element("rect");
    			path3 = svg_element("path");
    			rect1 = svg_element("rect");
    			g2 = svg_element("g");
    			path4 = svg_element("path");
    			attr_dev(path0, "d", shieldPaths.heater);
    			add_location(path0, file$x, 48, 4, 1967);
    			attr_dev(clipPath, "id", "shieldAbout");
    			add_location(clipPath, file$x, 47, 2, 1934);
    			attr_dev(path1, "stroke-width", "1");
    			attr_dev(path1, "d", "M25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z");
    			add_location(path1, file$x, 52, 4, 2090);
    			attr_dev(path2, "d", /*paths*/ ctx[7][/*division*/ ctx[6]][0]);
    			add_location(path2, file$x, 53, 4, 2211);
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "200");
    			attr_dev(rect0, "height", "200");
    			attr_dev(rect0, "fill", rect0_fill_value = /*$colors*/ ctx[2][/*t1*/ ctx[4]]);
    			add_location(rect0, file$x, 56, 6, 2331);
    			attr_dev(path3, "d", /*paths*/ ctx[7][/*division*/ ctx[6]][1]);
    			attr_dev(path3, "fill", path3_fill_value = /*$colors*/ ctx[2][/*t2*/ ctx[5]]);
    			add_location(path3, file$x, 57, 6, 2403);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "0");
    			attr_dev(rect1, "width", "200");
    			attr_dev(rect1, "height", "200");
    			attr_dev(rect1, "fill", "url(#nourse)");
    			add_location(rect1, file$x, 58, 6, 2461);
    			attr_dev(g0, "stroke", "none");
    			add_location(g0, file$x, 55, 4, 2278);
    			attr_dev(g1, "clip-path", "url(#shieldAbout)");
    			attr_dev(g1, "stroke", "#fff");
    			attr_dev(g1, "stroke-width", ".5");
    			add_location(g1, file$x, 51, 2, 2019);
    			attr_dev(path4, "d", shieldPaths.heater);
    			add_location(path4, file$x, 63, 4, 2596);
    			attr_dev(g2, "stroke", "#000");
    			attr_dev(g2, "fill", "url(#backlight)");
    			add_location(g2, file$x, 62, 2, 2550);
    			attr_dev(svg, "width", /*size*/ ctx[1]);
    			attr_dev(svg, "height", /*size*/ ctx[1]);
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			add_location(svg, file$x, 46, 0, 1876);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, clipPath);
    			append_dev(clipPath, path0);
    			append_dev(svg, g1);
    			append_dev(g1, path1);
    			append_dev(g1, path2);
    			append_dev(g1, g0);
    			append_dev(g0, rect0);
    			append_dev(g0, path3);
    			append_dev(g0, rect1);
    			append_dev(svg, g2);
    			append_dev(g2, path4);
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*$colors*/ 4 && rect0_fill_value !== (rect0_fill_value = /*$colors*/ ctx[2][/*t1*/ ctx[4]])) {
    				attr_dev(rect0, "fill", rect0_fill_value);
    			}

    			if (dirty & /*$colors*/ 4 && path3_fill_value !== (path3_fill_value = /*$colors*/ ctx[2][/*t2*/ ctx[5]])) {
    				attr_dev(path3, "fill", path3_fill_value);
    			}

    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "width", /*size*/ ctx[1]);
    			}

    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "height", /*size*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (!path1_intro) {
    				add_render_callback(() => {
    					path1_intro = create_in_transition(path1, draw, { duration: /*duration*/ ctx[0] });
    					path1_intro.start();
    				});
    			}

    			if (!path2_intro) {
    				add_render_callback(() => {
    					path2_intro = create_in_transition(path2, draw, { delay: /*duration*/ ctx[0] });
    					path2_intro.start();
    				});
    			}

    			if (!g0_intro) {
    				add_render_callback(() => {
    					g0_intro = create_in_transition(g0, fade, {
    						delay: /*delay*/ ctx[3],
    						duration: /*duration*/ ctx[0]
    					});

    					g0_intro.start();
    				});
    			}

    			if (!path4_intro) {
    				add_render_callback(() => {
    					path4_intro = create_in_transition(path4, draw, {
    						delay: /*delay*/ ctx[3],
    						duration: /*duration*/ ctx[0]
    					});

    					path4_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let $colors;
    	validate_store(colors, 'colors');
    	component_subscribe($$self, colors, $$value => $$invalidate(2, $colors = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AnimatedCOA', slots, []);
    	let { duration } = $$props;
    	const delay = duration * 2.6;

    	const tinctures = {
    		metals: { argent: 3, or: 2 },
    		colors: {
    			gules: 5,
    			sable: 3,
    			azure: 4,
    			vert: 2,
    			purpure: 3
    		}
    	};

    	const metal = Math.random() > 0.5;
    	const t1 = metal ? rw(tinctures.metals) : rw(tinctures.colors);
    	const t2 = metal ? rw(tinctures.colors) : rw(tinctures.metals);

    	const division = rw({
    		perPale: 2,
    		perFess: 2,
    		perBend: 2,
    		perBendSinister: 1,
    		perCross: 6,
    		perChevron: 1,
    		perChevronReversed: 1,
    		perPile: 2,
    		perSaltire: 5,
    		gyronny: 1,
    		chevronny: 1
    	});

    	const paths = {
    		perPale: ["M100,25 v175", "M100,0 v200 h100 v-200 Z"],
    		perFess: ["M27.5,100 h145", "M0,100 h200 v100 h-200 Z"],
    		perBend: ["M0,0 l200,200", "M0,0 l200,200 h-200 Z"],
    		perBendSinister: ["M200,0 L0,200", "M200,0 L0,200 h200 Z"],
    		perCross: ["M100,25 v175 M27.5,100 h145", "M100,0 v200 h-100 v-100 h200 v-100 Z"],
    		perChevron: ["M0,0 l100,100 l100,-100", "M0,0 l100,100 l100,-100 Z"],
    		perChevronReversed: ["M0,200 l100,-100 l100,100", "M0,200 l100,-100 l100,100 Z"],
    		perPile: ["M15,0 l85,200 l85,-200", "M15,0 l85,200 l85,-200 Z"],
    		perSaltire: ["M0,0 L200,200 M200,0 l-200,200", "M0,0 L200,200 v-200 l-200,200 Z"],
    		gyronny: [
    			"M0,0 l200,200 M200,100 h-200 M100,0 v200 M0,200 l200,-200",
    			"M0,0 l200,200 v-100 h-200 h-100 M100,0 v200, h-100 l200,-200 h-100"
    		],
    		chevronny: [
    			"",
    			"M0,80 100,-15 200,80 200,120 100,25 0,120z M0,160 100,65 200,160 200,200 100,105 0,200z M0,240 100,145 200,240 0,240z"
    		]
    	};

    	let size = window.innerWidth < 600 ? window.innerWidth * 0.9 : 500;
    	if (window.innerHeight < 600) size *= 0.5;
    	const writable_props = ['duration'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AnimatedCOA> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('duration' in $$props) $$invalidate(0, duration = $$props.duration);
    	};

    	$$self.$capture_state = () => ({
    		colors,
    		shieldPaths,
    		fade,
    		draw,
    		rw,
    		duration,
    		delay,
    		tinctures,
    		metal,
    		t1,
    		t2,
    		division,
    		paths,
    		size,
    		$colors
    	});

    	$$self.$inject_state = $$props => {
    		if ('duration' in $$props) $$invalidate(0, duration = $$props.duration);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [duration, size, $colors, delay, t1, t2, division, paths];
    }

    class AnimatedCOA extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, { duration: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AnimatedCOA",
    			options,
    			id: create_fragment$x.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*duration*/ ctx[0] === undefined && !('duration' in props)) {
    			console.warn("<AnimatedCOA> was created without expected prop 'duration'");
    		}
    	}

    	get duration() {
    		throw new Error("<AnimatedCOA>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<AnimatedCOA>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\navigation\About.svelte generated by Svelte v3.44.2 */
    const file$w = "src\\components\\navigation\\About.svelte";

    function create_fragment$w(ctx) {
    	let div1;
    	let span0;
    	let t1;
    	let animatedcoa;
    	let t2;
    	let div0;
    	let a0;
    	let span1;
    	let t4;
    	let a1;
    	let span2;
    	let t6;
    	let a2;
    	let span3;
    	let t8;
    	let a3;
    	let span4;
    	let t10;
    	let a4;
    	let span5;
    	let div0_intro;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	animatedcoa = new AnimatedCOA({ props: { duration }, $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "×";
    			t1 = space();
    			create_component(animatedcoa.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			a0 = element("a");
    			span1 = element("span");
    			span1.textContent = "Tutorial";
    			t4 = space();
    			a1 = element("a");
    			span2 = element("span");
    			span2.textContent = "Discord";
    			t6 = space();
    			a2 = element("a");
    			span3 = element("span");
    			span3.textContent = "GitHub";
    			t8 = space();
    			a3 = element("a");
    			span4 = element("span");
    			span4.textContent = "API";
    			t10 = space();
    			a4 = element("a");
    			span5 = element("span");
    			span5.textContent = "Patreon";
    			attr_dev(span0, "class", "close svelte-1rl23si");
    			add_location(span0, file$w, 12, 2, 285);
    			attr_dev(span1, "translate", "no");
    			attr_dev(span1, "class", "svelte-1rl23si");
    			add_location(span1, file$w, 15, 86, 530);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "href", "https://github.com/Azgaar/Armoria/wiki/Armoria-Tutorial");
    			attr_dev(a0, "class", "svelte-1rl23si");
    			add_location(a0, file$w, 15, 4, 448);
    			attr_dev(span2, "translate", "no");
    			attr_dev(span2, "class", "svelte-1rl23si");
    			add_location(span2, file$w, 16, 65, 637);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "https://discord.com/invite/X7E84HU");
    			attr_dev(a1, "class", "svelte-1rl23si");
    			add_location(a1, file$w, 16, 4, 576);
    			attr_dev(span3, "translate", "no");
    			attr_dev(span3, "class", "svelte-1rl23si");
    			add_location(span3, file$w, 17, 64, 742);
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "href", "https://github.com/Azgaar/Armoria");
    			attr_dev(a2, "class", "svelte-1rl23si");
    			add_location(a2, file$w, 17, 4, 682);
    			attr_dev(span4, "translate", "no");
    			attr_dev(span4, "class", "svelte-1rl23si");
    			add_location(span4, file$w, 18, 75, 857);
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "href", "https://github.com/Azgaar/armoria-api#readme");
    			attr_dev(a3, "class", "svelte-1rl23si");
    			add_location(a3, file$w, 18, 4, 786);
    			attr_dev(span5, "translate", "no");
    			attr_dev(span5, "class", "svelte-1rl23si");
    			add_location(span5, file$w, 19, 61, 955);
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "href", "https://www.patreon.com/azgaar");
    			attr_dev(a4, "class", "svelte-1rl23si");
    			add_location(a4, file$w, 19, 4, 898);
    			attr_dev(div0, "class", "buttons svelte-1rl23si");
    			add_location(div0, file$w, 14, 2, 376);
    			attr_dev(div1, "id", "about");
    			attr_dev(div1, "class", "svelte-1rl23si");
    			add_location(div1, file$w, 11, 0, 249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span0);
    			append_dev(div1, t1);
    			mount_component(animatedcoa, div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(a0, span1);
    			append_dev(div0, t4);
    			append_dev(div0, a1);
    			append_dev(a1, span2);
    			append_dev(div0, t6);
    			append_dev(div0, a2);
    			append_dev(a2, span3);
    			append_dev(div0, t8);
    			append_dev(div0, a3);
    			append_dev(a3, span4);
    			append_dev(div0, t10);
    			append_dev(div0, a4);
    			append_dev(a4, span5);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span0, "click", /*handleClose*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(animatedcoa.$$.fragment, local);

    			if (!div0_intro) {
    				add_render_callback(() => {
    					div0_intro = create_in_transition(div0, fly, { y: 200, delay: duration, duration });
    					div0_intro.start();
    				});
    			}

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(animatedcoa.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(animatedcoa);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const duration = 1000;

    function instance$w($$self, $$props, $$invalidate) {
    	let $state;
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(1, $state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);

    	const handleClose = () => {
    		set_store_value(state, $state.about = 0, $state);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		AnimatedCOA,
    		state,
    		fade,
    		fly,
    		duration,
    		handleClose,
    		$state
    	});

    	return [handleClose];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$w.name
    		});
    	}
    }

    /* src\components\navigation\License.svelte generated by Svelte v3.44.2 */
    const file$v = "src\\components\\navigation\\License.svelte";

    function get_each_context$f(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i].charge;
    	child_ctx[9] = list[i].license;
    	child_ctx[10] = list[i].source;
    	return child_ctx;
    }

    // (50:4) {#if chargeData.length}
    function create_if_block_2$5(ctx) {
    	let hr;
    	let t0;
    	let h2;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Currently displayed Coat of Arms";
    			attr_dev(hr, "class", "svelte-6budes");
    			add_location(hr, file$v, 50, 6, 2217);
    			add_location(h2, file$v, 51, 6, 2231);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(50:4) {#if chargeData.length}",
    		ctx
    	});

    	return block;
    }

    // (57:4) {:else}
    function create_else_block$6(ctx) {
    	let div;
    	let each_value = /*chargeData*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$f(get_each_context$f(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "chargesList svelte-6budes");
    			add_location(div, file$v, 57, 6, 2446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*chargeData*/ 8) {
    				each_value = /*chargeData*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$f(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$f(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(57:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (55:4) {#if isLicenseSame}
    function create_if_block_1$7(ctx) {
    	let h3;

    	let t0_value = (/*chargeData*/ ctx[3].length > 1
    	? "Charges"
    	: /*charge*/ ctx[5].charge) + "";

    	let t0;
    	let t1;
    	let html_tag;
    	let raw0_value = /*charge*/ ctx[5].license + "";
    	let t2;
    	let html_tag_1;
    	let raw1_value = /*charge*/ ctx[5].source + "";

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = text(": ");
    			html_tag = new HtmlTag();
    			t2 = text(", ");
    			html_tag_1 = new HtmlTag();
    			html_tag.a = t2;
    			html_tag_1.a = null;
    			add_location(h3, file$v, 55, 6, 2318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			html_tag.m(raw0_value, h3);
    			append_dev(h3, t2);
    			html_tag_1.m(raw1_value, h3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(55:4) {#if isLicenseSame}",
    		ctx
    	});

    	return block;
    }

    // (59:8) {#each chargeData as {charge, license, source}}
    function create_each_block$f(ctx) {
    	let div;
    	let t0_value = /*charge*/ ctx[5] + "";
    	let t0;
    	let t1;
    	let html_tag;
    	let raw0_value = /*license*/ ctx[9] + "";
    	let t2;
    	let html_tag_1;
    	let raw1_value = /*source*/ ctx[10] + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(": ");
    			html_tag = new HtmlTag();
    			t2 = text(", ");
    			html_tag_1 = new HtmlTag();
    			html_tag.a = t2;
    			html_tag_1.a = null;
    			add_location(div, file$v, 59, 10, 2540);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			html_tag.m(raw0_value, div);
    			append_dev(div, t2);
    			html_tag_1.m(raw1_value, div);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$f.name,
    		type: "each",
    		source: "(59:8) {#each chargeData as {charge, license, source}}",
    		ctx
    	});

    	return block;
    }

    // (65:4) {#if wetaShield($shield)}
    function create_if_block$e(ctx) {
    	let p;
    	let t0;
    	let i;
    	let t1_value = capitalize(/*$shield*/ ctx[1]) + "";
    	let t1;
    	let t2;
    	let a;
    	let t4;
    	let html_tag;
    	let raw0_value = link("https://www.middleearth.com", "Middle-earth Enterprises") + "";
    	let t5;
    	let html_tag_1;
    	let raw1_value = link("https://www.warnerbros.com/company/divisions/motion-pictures", "New Line Productions") + "";
    	let t6;
    	let html_tag_2;
    	let raw2_value = link("https://en.wikipedia.org/wiki/Fair_use", "fair use") + "";
    	let t7;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("As per my information, shield shape close to ");
    			i = element("i");
    			t1 = text(t1_value);
    			t2 = text(" is designed for the Lord of the Rings film series by\r\n        ");
    			a = element("a");
    			a.textContent = "Weta Workshop";
    			t4 = text(". The shape itself is drawn by Azgaar, but as design itself may be protected and owned by ");
    			html_tag = new HtmlTag();
    			t5 = text(" or ");
    			html_tag_1 = new HtmlTag();
    			t6 = text(", it is recommended to not use this shape for\r\n        any purposes outside of the ");
    			html_tag_2 = new HtmlTag();
    			t7 = text(" concept.");
    			add_location(i, file$v, 66, 53, 2733);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", "www.wetanz.com");
    			add_location(a, file$v, 67, 8, 2824);
    			html_tag.a = t5;
    			html_tag_1.a = t6;
    			html_tag_2.a = t7;
    			add_location(p, file$v, 65, 6, 2675);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, i);
    			append_dev(i, t1);
    			append_dev(p, t2);
    			append_dev(p, a);
    			append_dev(p, t4);
    			html_tag.m(raw0_value, p);
    			append_dev(p, t5);
    			html_tag_1.m(raw1_value, p);
    			append_dev(p, t6);
    			html_tag_2.m(raw2_value, p);
    			append_dev(p, t7);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$shield*/ 2 && t1_value !== (t1_value = capitalize(/*$shield*/ ctx[1]) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$e.name,
    		type: "if",
    		source: "(65:4) {#if wetaShield($shield)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$v(ctx) {
    	let div1;
    	let span;
    	let t1;
    	let div0;
    	let h1;
    	let t3;
    	let t4;
    	let t5;
    	let show_if = /*wetaShield*/ ctx[2](/*$shield*/ ctx[1]);
    	let t6;
    	let hr0;
    	let t7;
    	let h20;
    	let t8;
    	let html_tag;
    	let raw0_value = link("https://github.com/Azgaar/Armoria", "Azgaar") + "";
    	let t9;
    	let p0;
    	let t11;
    	let p1;
    	let t13;
    	let hr1;
    	let t14;
    	let h21;
    	let t15;
    	let html_tag_1;
    	let raw1_value = link("https://creativecommons.org/licenses/by/4.0", "CC BY 4.0") + "";
    	let t16;
    	let html_tag_2;
    	let raw2_value = link("https://fontawesome.com/license/free", "Font Awesome") + "";
    	let t17;
    	let br;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*chargeData*/ ctx[3].length && create_if_block_2$5(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*isLicenseSame*/ ctx[4]) return create_if_block_1$7;
    		return create_else_block$6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = show_if && create_if_block$e(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "×";
    			t1 = space();
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Armoria License";
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if_block1.c();
    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			hr0 = element("hr");
    			t7 = space();
    			h20 = element("h2");
    			t8 = text("Code: MIT License, ");
    			html_tag = new HtmlTag();
    			t9 = space();
    			p0 = element("p");
    			p0.textContent = "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal\r\n      in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\r\n      copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice\r\n      and this permission notice shall be included in all copies or substantial portions of the Software.";
    			t11 = space();
    			p1 = element("p");
    			p1.textContent = "The software is provided \"As is\", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability,\r\n      fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other\r\n      liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in\r\n      the software.";
    			t13 = space();
    			hr1 = element("hr");
    			t14 = space();
    			h21 = element("h2");
    			t15 = text("Icons: ");
    			html_tag_1 = new HtmlTag();
    			t16 = text(", ");
    			html_tag_2 = new HtmlTag();
    			t17 = space();
    			br = element("br");
    			attr_dev(span, "class", "close svelte-6budes");
    			add_location(span, file$v, 45, 2, 2045);
    			add_location(h1, file$v, 47, 4, 2154);
    			attr_dev(hr0, "class", "svelte-6budes");
    			add_location(hr0, file$v, 75, 4, 3369);
    			html_tag.a = null;
    			add_location(h20, file$v, 76, 4, 3381);
    			add_location(p0, file$v, 77, 4, 3474);
    			add_location(p1, file$v, 83, 4, 4081);
    			attr_dev(hr1, "class", "svelte-6budes");
    			add_location(hr1, file$v, 90, 4, 4591);
    			html_tag_1.a = t16;
    			html_tag_2.a = null;
    			add_location(h21, file$v, 91, 4, 4603);
    			add_location(br, file$v, 94, 4, 4781);
    			attr_dev(div0, "id", "licenseContainer");
    			attr_dev(div0, "class", "svelte-6budes");
    			add_location(div0, file$v, 46, 2, 2121);
    			attr_dev(div1, "id", "license");
    			attr_dev(div1, "class", "svelte-6budes");
    			add_location(div1, file$v, 44, 0, 2007);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t3);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t4);
    			if_block1.m(div0, null);
    			append_dev(div0, t5);
    			if (if_block2) if_block2.m(div0, null);
    			append_dev(div0, t6);
    			append_dev(div0, hr0);
    			append_dev(div0, t7);
    			append_dev(div0, h20);
    			append_dev(h20, t8);
    			html_tag.m(raw0_value, h20);
    			append_dev(div0, t9);
    			append_dev(div0, p0);
    			append_dev(div0, t11);
    			append_dev(div0, p1);
    			append_dev(div0, t13);
    			append_dev(div0, hr1);
    			append_dev(div0, t14);
    			append_dev(div0, h21);
    			append_dev(h21, t15);
    			html_tag_1.m(raw1_value, h21);
    			append_dev(h21, t16);
    			html_tag_2.m(raw2_value, h21);
    			append_dev(div0, t17);
    			append_dev(div0, br);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if_block1.p(ctx, dirty);
    			if (dirty & /*$shield*/ 2) show_if = /*wetaShield*/ ctx[2](/*$shield*/ ctx[1]);

    			if (show_if) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$e(ctx);
    					if_block2.c();
    					if_block2.m(div0, t6);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getLicenseName(license) {
    	if (!license) return null;
    	if (license.includes("publicdomain")) return "public domain";
    	if (license.includes("by-nc-sa")) return "CC BY-NC-SA";
    	if (license.includes("by-nc-nd")) return "CC BY-NC-ND";
    	if (license.includes("by-nc")) return "CC BY-NC";
    	if (license.includes("by-nd")) return "CC BY-ND";
    	if (license.includes("by-sa")) return "CC BY-SA";
    	if (license.includes("by")) return "CC BY";
    	if (license.includes("Fair")) return "fair use";
    	return license;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let $state;
    	let $shield;
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(0, $state = $$value));
    	validate_store(shield, 'shield');
    	component_subscribe($$self, shield, $$value => $$invalidate(1, $shield = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('License', slots, []);
    	const wetaShield = shield => ["noldor", "gondor", "easterling", "ironHills", "urukHai", "moriaOrc"].includes(shield);
    	const coas = Array.from(document.querySelectorAll("svg.coa"));
    	const charges = coas.map(coa => Array.from(coa.querySelectorAll(".charge[charge]")).map(el => el.getAttribute("charge"))).flat();

    	const chargeData = [...new Set(charges)].map(charge => {
    		const el = document.getElementById(charge);
    		const licenseURL = el.getAttribute("license");
    		const licenseName = getLicenseName(licenseURL);
    		const sourceURL = el.getAttribute("source");
    		const author = el.getAttribute("author") || (sourceURL ? new URL(sourceURL).host : null);

    		const license = licenseURL && licenseName
    		? link(licenseURL, licenseName)
    		: "no license data";

    		const source = sourceURL
    		? link(sourceURL, author)
    		: author || "no source data";

    		return {
    			charge: capitalize(charge),
    			license,
    			source
    		};
    	}).sort((a, b) => a.license < b.license ? -1 : 1);

    	const isLicenseSame = [...new Set(chargeData.map(d => [d.license, d.source].join(",")))].length === 1;
    	const charge = isLicenseSame ? chargeData[0] : null;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<License> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => set_store_value(state, $state.license = 0, $state);

    	$$self.$capture_state = () => ({
    		fade,
    		shield,
    		state,
    		capitalize,
    		link,
    		wetaShield,
    		coas,
    		charges,
    		chargeData,
    		isLicenseSame,
    		charge,
    		getLicenseName,
    		$state,
    		$shield
    	});

    	return [$state, $shield, wetaShield, chargeData, isLicenseSame, charge, click_handler];
    }

    class License extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "License",
    			options,
    			id: create_fragment$v.name
    		});
    	}
    }

    function drag(e, c, coa) {
      const el = e.currentTarget;
      const x0 = e.x,
        y0 = e.y;
      const sizeAdj = +el.closest("svg").getAttribute("width") / 200;
      document.addEventListener("mouseup", dragStop, {once: true});

      const x = c.x || 0;
      const y = c.y || 0;
      const size = c.size || 1;
      c.angle || 0;
      const gridSize = get_store_value(grid);

      if (e.shiftKey) {
        document.addEventListener("mousemove", resize);
        document.body.style.cursor = "ns-resize";
      } else if (e.ctrlKey || e.metaKey) {
        document.addEventListener("mousemove", rotate);
        document.body.style.cursor = "ew-resize";
      } else {
        document.addEventListener("mousemove", move);
        document.body.style.cursor = "move";
      }

      function move(e) {
        const dx = x + (e.x - x0) / sizeAdj;
        const dy = y + (e.y - y0) / sizeAdj;

        c.x = Math.round(dx / gridSize) * gridSize;
        c.y = Math.round(dy / gridSize) * gridSize;
        setTransform(el, c);
      }

      function resize(e) {
        const dy = y + (e.y - y0) / sizeAdj;
        c.size = round$1(size + dy / -100);
        setTransform(el, c);
        if (c.p) changes.add(JSON.stringify(coa));
      }

      function rotate(e) {
        const cx = x + 100,
          cy = y + 100;
        const x1 = e.x / sizeAdj,
          y1 = e.y / sizeAdj;

        let a = 90 + (Math.atan2(y1 - cy, x1 - cx) * 180) / Math.PI;
        if (a > 180) a = (a % 180) - 180;
        if (a < -179) a = (a % 180) + 180;

        c.angle = Math.round(a / gridSize) * gridSize;
        setTransform(el, c);
      }

      function setTransform(el, c) {
        const tr = transform(c);
        if (tr) el.setAttribute("transform", tr);
        else el.removeAttribute("transform");
      }

      function dragStop() {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mousemove", rotate);
        document.body.style.cursor = "auto";
        changes.add(JSON.stringify(coa));
      }
    }

    function round$1(n) {
      return Math.round(n * 100) / 100;
    }

    function transform(charge) {
      let {x = 0, y = 0, angle = 0, size = 1, p} = charge;
      if (p) size = 1; // size is defined on use element level

      if (size !== 1) {
        x = round$1(x + 100 - size * 100);
        y = round$1(y + 100 - size * 100);
      }

      let transform = "";
      if (x || y) transform += `translate(${x} ${y})`;
      if (angle) transform += ` rotate(${angle} ${size * 100} ${size * 100})`;
      if (size !== 1) transform += ` scale(${size})`;

      return transform ? transform.trim() : null;
    }

    const lines = {
      straight: "m 0,100 v15 h 200 v -15 z",
      engrailed: "m 0,95 a 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 6.25,6.25 0 0 0 12.5,0 v 20 H 0 Z",
      invecked: "M0,102.5 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 a6.25,6.25,0,0,1,12.5,0 v12.5 H0 z",
      embattled: "M 0,105 H 2.5 V 95 h 15 v 10 h 15 V 95 h 15 v 10 h 15 V 95 h 15 v 10 h 15 V 95 h 15 v 10 h 15 V 95 h 15 v 10 h 15 V 95 h 15 v 10 h 15 V 95 h 15 v 10 h 2.5 v 10 H 0 Z",
      wavy: "m 200,115 v -15 c -8.9,3.5 -16,3.1 -25,0 -8.9,-3.5 -16,-3.1 -25,0 -8.9,3.5 -16,3.2 -25,0 -8.9,-3.5 -16,-3.2 -25,0 -8.9,3.5 -16,3.1 -25,0 -8.9,-3.5 -16,-3.1 -25,0 -8.9,3.5 -16,3.2 -25,0 -8.9,-3.5 -16,-3.2 -25,0 v 15 z",
      raguly: "m 200,95 h -3 l -5,10 h -10 l 5,-10 h -10 l -5,10 h -10 l 5,-10 h -10 l -5,10 h -10 l 5,-10 h -10 l -5,10 h -10 l 5,-10 h -10 l -5,10 h -10 l 5,-10 H 97 l -5,10 H 82 L 87,95 H 77 l -5,10 H 62 L 67,95 H 57 l -5,10 H 42 L 47,95 H 37 l -5,10 H 22 L 27,95 H 17 l -5,10 H 2 L 7,95 H 0 v 20 h 200 z",
      dancetty: "m 0,105 10,-15 15,20 15,-20 15,20 15,-20 15,20 15,-20 15,20 15,-20 15,20 15,-20 15,20 15,-20 10,15 v 10 H 0 Z",
      dentilly: "M 180,105 170,95 v 10 L 160,95 v 10 L 150,95 v 10 L 140,95 v 10 L 130,95 v 10 L 120,95 v 10 L 110,95 v 10 L 100,95 v 10 L 90,95 v 10 L 80,95 v 10 L 70,95 v 10 L 60,95 v 10 L 50,95 v 10 L 40,95 v 10 L 30,95 v 10 L 20,95 v 10 L 10,95 v 10 L 0,95 v 20 H 200 V 105 L 190,95 v 10 L 180,95 Z",
      angled: "m 0,95 h 100 v 10 h 100 v 10 H 0 Z",
      urdy: "m 200,90 -5,5 v 10 l -5,5 -5,-5 V 95 l -5,-5 -5,5 v 10 l -5,5 -5,-5 V 95 l -5,-5 -5,5 v 10 l -5,5 -5,-5 V 95 l -5,-5 -5,5 v 10 l -5,6 -5,-6 V 95 l -5,-5 -5,5 v 10 l -5,5 -5,-5 V 95 l -5,-5 -5,5 v 10 l -5,5 -5,-5 V 95 l -5,-5 -5,5 v 10 l -5,6 -5,-6 V 95 l -5,-5 -5,5 v 10 l -5,5 -5,-5 V 95 l -5,-5 -5,5 v 10 l -5,5 -5,-5 V 95 l -5,-5 -5,5 v 10 l -5,5 -5,-5 V 95 L 0,90 v 25 h 200",
      indented: "m 100,95 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 5,-10 v 20 H 0 V 95 l 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 5,-10 5,10 z",
      bevilled: "m 0,92.5 h 110 l -20,15 H 200 V 115 H 0 Z",
      nowy: "m 0,95 h 80 c 0,0 0.1,20.1 20,20 19.9,-0.1 20,-20 20,-20 h 80 v 20 H 0 Z",
      nowyReversed: "m 200,105 h -80 c 0,0 -0.1,-20.1 -20,-20 -19.9,0.1 -20,20 -20,20 H 0 v 10 h 200 z",
      potenty: "m 3,95 v 5 h 5 v 5 H 0 v 10 h 200 l 0.5,-10 H 193 v -5 h 5 v -5 h -15 v 5 h 5 v 5 h -15 v -5 h 5 v -5 h -15 v 5 h 5 v 5 h -15 v -5 h 5 v -5 h -15 v 5 h 5 v 5 h -15 v -5 h 5 v -5 h -15 v 5 h 5 v 5 h -15 v -5 h 5 v -5 h -15 v 5 h 5 v 5 H 100.5 93 v -5 h 5 V 95 H 83 v 5 h 5 v 5 H 73 v -5 h 5 V 95 H 63 v 5 h 5 v 5 H 53 v -5 h 5 V 95 H 43 v 5 h 5 v 5 H 33 v -5 h 5 V 95 H 23 v 5 h 5 v 5 H 13 v -5 h 5 v -5 z",
      potentyDexter: "m 200,105 h -2 v -10 0 0 h -10 v 5 h 5 v 5 H 183 V 95 h -10 v 5 h 5 v 5 H 168 V 95 h -10 v 5 h 5 v 5 H 153 V 95 h -10 v 5 h 5 v 5 H 138 V 95 h -10 v 5 h 5 v 5 H 123 V 95 h -10 v 5 h 5 v 5 h -10 v 0 0 -10 H 98 v 5 h 5 v 5 H 93 V 95 H 83 v 5 h 5 v 5 H 78 V 95 H 68 v 5 h 5 v 5 H 63 V 95 H 53 v 5 h 5 v 5 H 48 V 95 H 38 v 5 h 5 v 5 H 33 V 95 H 23 v 5 h 5 v 5 H 18 V 95 H 8 v 5 h 5 v 5 H 3 V 95 H 0 v 20 h 200 z",
      potentySinister: "m 2.5,95 v 10 H 0 v 10 h 202.5 v -15 h 5 v -5 h -10 v 10 h -10 v -5 h 5 v -5 h -10 v 10 h -10 v -5 h 5 v -5 h -10 v 10 h -10 v -5 h 5 v -5 h -10 v 10 h -10 v -5 h 5 v -5 h -10 v 10 h -10 v -5 h 5 v -5 h -10 v 10 h -10 v -5 h 5 v -5 h -10 v 10 h -10 v -5 h 5 v -5 h -10 v 10 h -10 v -5 h 5 v -5 h -10 v 10 h -10 v -5 h 5 v -5 h -10 v 10 h -10 v -5 h 5 v -5 h -10 v 10 h -10 v -5 h 5 v -5 h -10 v 10 h -10 v -5 h 5 v -5 h -10 v 10 h -10 v -5 h 5 v -5 z",
      embattledGhibellin: "M 200,200 V 100 l -5,-5 v 10 l -5,-5 -5,5 V 95 l -5,5 -5,-5 v 10 l -5,-5 -5,5 V 95 l -5,5 -5,-5 v 10 l -5,-5 -5,5 V 95 l -5,5 -5,-5 v 10 l -5,-5 -5,5 V 95 l -5,5 -5,-5 v 10 l -5,-5 -5,5 V 95 l -5,5 -5,-5 v 10 l -5,-5 -5,5 V 95 l -5,5 -5,-5 v 10 l -5,-5 -5,5 V 95 l -5,5 -5,-5 v 10 l -5,-5 -5,5 V 95 l -5,5 -5,-5 v 10 l -5,-5 -5,5 V 95 l -5,5 -5,-5 v 10 l -5,-5 -5,5 V 95 l -5,5 v 15 h 200",
      embattledNotched: "m 200,105 h -5 V 95 l -5,5 -5,-5 v 10 h -5 V 95 l -5,5 -5,-5 v 10 h -5 V 95 l -5,5 -5,-5 v 10 h -5 V 95 l -5,5 -5,-5 v 10 h -5 V 95 l -5,5 -5,-5 v 10 h -5 V 95 l -5,5 -5,-5 v 10 h -5 V 95 l -5,5 -5,-5 v 10 H 90 V 95 l -5,5 -5,-5 v 10 H 75 V 95 l -5,5 -5,-5 v 10 H 60 V 95 l -5,5 -5,-5 v 10 H 45 V 95 l -5,5 -5,-5 v 10 H 30 V 95 l -5,5 -5,-5 v 10 H 15 V 95 l -5,5 -5,-5 v 10 H 0 v 10 h 200",
      embattledGrady: "m 0,95 v 20 H 200 V 95 h -2.5 v 5 h -5 v 5 h -5 v -5 h -5 v -5 h -5 v 5 h -5 v 5 h -5 v -5 h -5 v -5 h -5 v 5 h -5 v 5 h -5 v -5 h -5 v -5 h -5 v 5 h -5 v 5 h -5 v -5 h -5 v -5 h -5 v 5 h -5 v 5 h -5 v -5 h -5 v -5 h -5 v 5 h -5 v 5 h -5 v -5 h -5 v -5 h -5 v 5 h -5 v 5 h -5 v -5 h -5 v -5 h -5 v 5 h -5 v 5 h -5 v -5 h -5 v -5 h -5 v 5 h -5 v 5 h -5 v -5 h -5 v -5 h -5 v 5 h -5 v 5 h -5 v -5 h -5 v -5 z",
      dovetailed: "m 200,95 h -7 l 4,10 h -14 l 4,-10 h -14 l 4,10 h -14 l 4,-10 h -14 l 4,10 h -14 l 4,-10 h -14 l 4,10 h -14 l 4,-10 h -14 l 4,10 h -14 l 4,-10 H 93 l 4,10 H 83 L 87,95 H 73 l 4,10 H 63 L 67,95 H 53 l 4,10 H 43 L 47,95 H 33 l 4,10 H 23 L 27,95 H 13 l 4,10 H 3 L 7,95 H 0 v 20 h 200",
      dovetailedIndented: "m 200,100 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 -7,-5 4,10 -7,-5 -7,5 4,-10 -7,5 v 15 h 200",
      nebuly: "m 13.1,89.8 c -4.1,0 -7.3,2 -7.3,4.5 0,1.2 0.7,2.3 1.8,3.1 1.2,0.7 1.9,1.8 1.9,3 0,2.5 -3.2,4.5 -7.3,4.5 -0.5,0 -2.2,-0.2 -2.2,-0.2 V 115 h 200 v -10.1 c -3.7,-0.2 -6.7,-2.2 -6.7,-4.5 0,-1.2 0.7,-2.3 1.9,-3 1.2,-0.8 1.8,-1.9 1.8,-3.1 0,-2.5 -3.2,-4.5 -7.2,-4.5 -4.1,0 -7.3,2 -7.3,4.5 0,1.2 0.7,2.3 1.8,3.1 1.2,0.7 1.9,1.8 1.9,3 0,2.5 -3.3,4.5 -7.3,4.5 -4,0 -7.3,-2 -7.3,-4.5 0,-1.2 0.7,-2.3 1.9,-3 1.2,-0.8 1.8,-1.9 1.8,-3.1 0,-2.5 -3.2,-4.5 -7.2,-4.5 -4.1,0 -7.3,2 -7.3,4.5 0,1.2 0.7,2.3 1.8,3.1 1.2,0.7 1.9,1.8 1.9,3 -1.5,4.1 -4.2,4.4 -8.8,4.5 -4.7,-0.1 -8.7,-1.5 -8.9,-4.5 0,-1.2 0.7,-2.3 1.9,-3 1.2,-0.8 1.9,-1.9 1.9,-3.1 0,-2.5 -3.3,-4.5 -7.3,-4.5 -4.1,0 -7.3,2 -7.3,4.5 0,1.2 0.7,2.3 1.8,3.1 1.2,0.7 1.9,1.8 1.9,3 0,2.5 -3.3,4.5 -7.3,4.5 -4,0 -7.3,-2 -7.3,-4.5 0,-1.2 0.7,-2.3 1.9,-3 1.2,-0.8 1.9,-1.9 1.9,-3.1 0,-2.5 -3.3,-4.5 -7.3,-4.5 -4.1,0 -7.3,2 -7.3,4.5 0,1.2 0.7,2.3 1.8,3.1 1.2,0.7 1.9,1.8 1.9,3 0,2.5 -3.3,4.5 -7.3,4.5 -4,0 -7.3,-2 -7.3,-4.5 0,-1.2 0.7,-2.3 1.9,-3 1.2,-0.8 1.9,-1.9 1.9,-3.1 0,-2.5 -3.3,-4.5 -7.3,-4.5 -4.1,0 -7.3,2 -7.3,4.5 0,1.2 0.7,2.3 1.8,3.1 1.2,0.7 1.9,1.8 1.9,3 0,2.5 -3.3,4.5 -7.3,4.5 -4,0 -7.3,-2 -7.3,-4.5 0,-1.2 0.7,-2.3 1.9,-3 1.2,-0.8 1.9,-1.9 1.9,-3.1 0,-2.5 -3.3,-4.5 -7.3,-4.5 -4.1,0 -7.3,2 -7.3,4.5 0,1.2 0.7,2.3 1.8,3.1 1.2,0.7 1.9,1.8 1.9,3 0,2.5 -3.3,4.5 -7.3,4.5 -4,0 -7.3,-2 -7.3,-4.5 0,-1.2 0.7,-2.3 1.9,-3 1.2,-0.8 1.9,-1.9 1.9,-3.1 0,-2.5 -3.3,-4.5 -7.3,-4.5 -4.1,0 -7.3,2 -7.3,4.5 0,1.2 0.7,2.3 1.8,3.1 1.2,0.7 1.9,1.8 1.9,3 0,2.5 -3.3,4.5 -7.3,4.5 -4,0 -7.3,-2 -7.3,-4.5 0,-1.2 0.7,-2.3 1.9,-3 1.2,-0.8 1.9,-1.9 1.9,-3.1 0,-2.5 -3.3,-4.5 -7.3,-4.5 -4.1,0 -7.3,2 -7.3,4.5 0,1.2 0.7,2.3 1.8,3.1 1.2,0.7 1.9,1.8 1.9,3 0,2.5 -3.3,4.5 -7.3,4.5 -4,0 -7.3,-2 -7.3,-4.5 0,-1.2 0.7,-2.3 1.9,-3 1.2,-0.8 1.9,-1.9 1.9,-3.1 0,-2.5 -3.3,-4.5 -7.3,-4.5 z",
      rayonne: "M0 115l-.1-6 .2.8c1.3-1 2.3-2.5 2.9-4.4.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4A9 9 0 015.5 90c-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 2.1 3.1 3.1 4.6 1 1.6 2.4 3.1 2.7 4.8.3 1.7.3 3.3 0 5.2 1.3-1 2.6-2.7 3.2-4.6.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.5 2 1.7 3.6 3.1 4.6a9 9 0 013.1 4.6c.5 2 .4 3.9-.3 5.4a9 9 0 003.1-4.6c.5-2 .4-3.9-.3-5.4-.7-1.5-.8-3.4-.3-5.4.5-2 1.7-3.6 3.1-4.6-.7 1.5-.8 3.4-.3 5.4.75 2.79 2.72 4.08 4.45 5.82L200 115z",
      seaWaves: "m 28.83,94.9 c -4.25,0 -7.16,3.17 -8.75,5.18 -1.59,2.01 -4.5,5.18 -8.75,5.18 -2.16,0 -3.91,-1.63 -3.91,-3.64 0,-2.01 1.44,-3.6 3.6,-3.6 0.7,0 1.36,0.17 1.93,0.48 -0.33,-2.03 -2.19,-3.56 -4.45,-3.56 -4.24,0 -6.91,3.13 -8.5,5.13 V 115 h 200 v -14.89 c -1.59,2.01 -4.5,5.18 -8.75,5.18 -2.16,0 -3.91,-1.63 -3.91,-3.64 0,-2.01 1.75,-3.64 3.91,-3.64 0.7,0 1.36,0.17 1.93,0.48 -0.34,-2.01 -2.2,-3.55 -4.46,-3.55 -4.25,0 -7.16,3.17 -8.75,5.18 -1.59,2.01 -4.5,5.18 -8.75,5.18 -2.16,0 -3.91,-1.63 -3.91,-3.64 0,-2.01 1.75,-3.64 3.91,-3.64 0.7,0 1.36,0.17 1.93,0.48 -0.34,-2.01 -2.21,-3.55 -4.46,-3.55 -4.25,0 -7.16,3.17 -8.75,5.18 -1.59,2.01 -4.5,5.18 -8.75,5.18 -2.16,0 -3.91,-1.63 -3.91,-3.64 0,-2.01 1.75,-3.64 3.91,-3.64 0.7,0 1.36,0.17 1.93,0.48 -0.34,-2.01 -2.21,-3.55 -4.46,-3.55 -4.25,0 -7.16,3.17 -8.75,5.18 -1.59,2.01 -4.5,5.18 -8.75,5.18 -2.16,0 -3.91,-1.63 -3.91,-3.64 0,-2.01 1.75,-3.64 3.91,-3.64 0.7,0 1.36,0.17 1.93,0.48 -0.34,-2.01 -2.2,-3.55 -4.46,-3.55 -4.25,0 -7.16,3.17 -8.75,5.18 -1.59,2.01 -4.5,5.18 -8.75,5.18 -2.16,0 -3.91,-1.63 -3.91,-3.64 0,-2.01 1.44,-3.6 3.6,-3.6 0.7,0 1.36,0.17 1.93,0.48 -0.34,-2.01 -2.21,-3.55 -4.46,-3.55 -4.25,0 -6.6,3.09 -8.19,5.09 -1.59,2.01 -4.5,5.18 -8.75,5.18 -2.16,0 -3.91,-1.63 -3.91,-3.64 0,-2.01 1.75,-3.64 3.91,-3.64 0.7,0 1.36,0.17 1.93,0.48 -0.34,-2.01 -2.21,-3.55 -4.46,-3.55 -4.25,0 -7.16,3.17 -8.75,5.18 -1.59,2.01 -4.5,5.18 -8.75,5.18 -2.16,0 -3.91,-1.63 -3.91,-3.64 0,-2.01 1.75,-3.64 3.91,-3.64 0.7,0 1.36,0.17 1.93,0.48 -0.34,-2.01 -2.2,-3.55 -4.46,-3.55 -4.25,0 -7.16,3.17 -8.75,5.18 -1.59,2.01 -4.5,5.18 -8.75,5.18 -2.16,0 -3.91,-1.63 -3.91,-3.64 0,-2.01 1.75,-3.64 3.91,-3.64 0.7,0 1.36,0.17 1.93,0.48 -0.34,-2.01 -2.2,-3.55 -4.46,-3.55 -4.25,0 -7.16,3.17 -8.75,5.18 -1.59,2.01 -4.5,5.18 -8.75,5.18 -2.16,0 -3.91,-1.63 -3.91,-3.64 0,-2.01 1.75,-3.64 3.91,-3.64 0.7,0 1.36,0.17 1.93,0.48 -0.34,-2.01 -2.21,-3.55 -4.46,-3.55 z",
      dragonTeeth: "M 9.4,85 C 6.5,88.1 4.1,92.9 3,98.8 1.9,104.6 2.3,110.4 3.8,115 2.4,113.5 0,106.6 0,109.3 v 5.7 h 200 v -5.7 c -1.1,-2.4 -2,-5.1 -2.6,-8 -1.1,-5.9 -0.7,-11.6 0.8,-16.2 -2.9,3.1 -5.3,7.9 -6.4,13.8 -1.1,5.9 -0.7,11.6 0.8,16.2 -2.9,-3.1 -5.3,-7.9 -6.4,-13.8 -1.1,-5.9 -0.7,-11.6 0.8,-16.2 -2.9,3.1 -5.3,7.9 -6.4,13.8 -1.1,5.9 -0.7,11.6 0.8,16.2 -2.9,-3.1 -5.3,-7.9 -6.4,-13.8 -1.1,-5.9 -0.7,-11.6 0.8,-16.2 -2.9,3.1 -5.3,7.9 -6.4,13.8 -1.1,5.9 -0.7,11.6 0.8,16.2 -2.9,-3.1 -5.3,-7.9 -6.4,-13.8 -1.1,-5.9 -0.7,-11.6 0.8,-16.2 -2.9,3.1 -5.3,7.9 -6.4,13.8 -1.1,5.9 -0.7,11.6 0.8,16.2 -2.9,-3.1 -5.3,-7.9 -6.4,-13.8 -1.1,-5.9 -0.7,-11.6 0.8,-16.2 -2.9,3.1 -5.3,7.9 -6.4,13.8 -1.1,5.9 -0.7,11.6 0.8,16.2 -2.9,-3.1 -5.3,-7.9 -6.4,-13.8 -1.1,-5.9 -0.7,-11.6 0.8,-16.2 -2.9,3.1 -5.3,7.9 -6.4,13.8 -1.1,5.9 -0.7,11.6 0.8,16.2 -2.9,-3.1 -5.3,-7.9 -6.4,-13.8 -1.1,-5.9 -0.7,-11.6 0.8,-16.2 -2.9,3.1 -5.3,7.9 -6.4,13.8 -1.1,5.9 -0.7,11.6 0.8,16.2 -2.9,-3.1 -5.3,-7.9 -6.4,-13.8 -1.1,-5.9 -0.7,-11.6 0.8,-16.2 -2.9,3.1 -5.3,7.9 -6.4,13.8 -1.1,5.9 -0.7,11.6 0.8,16.2 -2.9,-3.1 -5.3,-7.9 -6.4,-13.8 -1.1,-5.9 -0.7,-11.6 0.8,-16.2 -2.9,3.1 -5.3,7.9 -6.4,13.8 -1.1,5.9 -0.7,11.6 0.8,16.2 -1.4,-1.5 -2.8,-3.9 -3.8,-6.1 -1.1,-2.4 -2.3,-6.1 -2.6,-7.7 -0.2,-5.9 0.2,-11.7 1.7,-16.3 -3,3.1 -5.3,7.9 -6.4,13.8 -1.1,5.8 -0.7,11.6 0.8,16.2 -2.9,-3.1 -5.3,-7.9 -6.4,-13.8 -1,-5.8 -0.7,-11.6 0.9,-16.2 -3,3.1 -5.3,7.9 -6.4,13.8 -1.1,5.8 -0.7,11.6 0.8,16.2 -2.9,-3.1 -5.3,-7.9 -6.4,-13.8 -1.1,-5.8 -0.7,-11.6 0.9,-16.2 -3,3.1 -5.3,7.9 -6.4,13.8 -1.1,5.8 -0.7,11.6 0.8,16.2 -2.9,-3.1 -5.3,-7.9 -6.4,-13.8 C 63,95.4 63.4,89.6 64.9,85 c -2.9,3.1 -5.3,7.9 -6.3,13.8 -1.1,5.8 -0.7,11.6 0.8,16.2 -3,-3.1 -5.3,-7.9 -6.4,-13.8 -1.1,-5.8 -0.7,-11.6 0.8,-16.2 -2.9,3.1 -5.3,7.9 -6.4,13.8 -1,5.8 -0.6,11.6 0.9,16.2 -3,-3.1 -5.3,-7.9 -6.4,-13.8 -1.1,-5.8 -0.7,-11.6 0.8,-16.2 -2.9,3.1 -5.3,7.9 -6.4,13.8 -1,5.8 -0.7,11.6 0.9,16.2 -3,-3.1 -5.3,-7.9 -6.4,-13.8 -1.1,-5.8 -0.7,-11.6 0.8,-16.2 -2.9,3.1 -5.3,7.9 -6.4,13.8 -1.1,5.8 -0.7,11.6 0.9,16.2 -3,-3.1 -5.3,-7.9 -6.4,-13.8 C 18.6,95.4 19,89.6 20.5,85 17.6,88.1 15.2,92.9 14.1,98.8 13,104.6 13.4,110.4 14.9,115 12,111.9 9.6,107.1 8.6,101.2 7.5,95.4 7.9,89.6 9.4,85 Z",
      firTrees: "m 3.9,90 -4,7 2,-0.5 L 0,100 v 15 h 200 v -15 l -1.9,-3.5 2,0.5 -4,-7 -4,7 2,-0.5 -4,7 2,-0.5 -4,7 -4,-7 2,0.5 -4,-7 2,0.5 -4,-7 -4,7 2,-0.5 -4,7 2,-0.5 -4,7 -4,-7 2,0.5 -4,-7 2,0.5 -4,-7 -4,7 2,-0.5 -4,7 2,-0.5 -4,7 -4,-7 2,0.5 -4,-7 2,0.5 -4.1,-7 -4,7 2,-0.5 -4,7 2,-0.5 -4,7 -4,-7 2,0.5 -4,-7 2,0.5 -4,-7 -4,7 2,-0.5 -4,7 2,-0.5 -4,7 -4,-7 2,0.5 -4,-7 2,0.5 -4,-7 -4,7 2,-0.5 -4,7 2,-0.5 -4,7 -4,-7 2,0.5 -4,-7 2,0.5 -4,-7 -4,7 2,-0.5 -4,7 2,-0.5 -4,7 -4,-7 2,0.5 -4,-7 2,0.5 -4,-7 -4,7 2,-0.5 -4,7 2,-0.5 -4,7 -4,-7 2,0.5 -4,-7 2,0.5 -4,-7 -4,7 2,-0.5 -4,7 2,-0.5 -4,7 -4,-7 2,0.5 -4,-7 2,0.5 -4.1,-7 -4,7 2,-0.5 -4,7 2,-0.5 -4,7 -4,-7 2,0.5 -4,-7 2,0.5 -4,-7 -4,7 2,-0.5 -4,7 2,-0.5 -4,7 -4,-7 2,0.5 -4,-7 2,0.5 -4,-7 -4,7 2,-0.5 -4,7 2,-0.5 -4,7 -4,-7 2,0.5 -4,-7 2,0.5 z",
      flechy: "m 0,100 h 85 l 15,-15 15,15 h 85 v 15 H 0 Z",
      barby: "m 0,100 h 85 l 15,15 15,-15 h 85 v 15 H 0 Z",
      enclavy: "M 0,100 H 85 V 85 h 30 v 15 h 85 v 15 H 0 Z",
      escartely: "m 0,100 h 85 v 15 h 30 v -15 h 85 v 15 H 0 Z",
      arched: "m 100,95 c 40,-0.2 100,20 100,20 H 0 c 0,0 60,-19.8 100,-20 z",
      archedReversed: "m 0,85 c 0,0 60,20.2 100,20 40,-0.2 100,-20 100,-20 v 30 H 0 Z"
    };

    const templates = {
      // straight divisions
      perFess: `<rect x="0" y="100" width="200" height="100"/>`,
      perPale: `<rect x="100" y="0" width="100" height="200"/>`,
      perBend: `<polygon points="0,0 200,200 0,200"/>`,
      perBendSinister: `<polygon points="200,0 0,200 200,200"/>`,
      perChevron: `<polygon points="0,200 100,100 200,200"/>`,
      perChevronReversed: `<polygon points="0,0 100,100 200,0"/>`,
      perCross: `<rect x="100" y="0" width="100" height="100"/><rect x="0" y="100" width="100" height="100"/>`,
      perPile: `<polygon points="0,0 15,0 100,200 185,0 200,0 200,200 0,200"/>`,
      perSaltire: `<polygon points="0,0 0,200 200,0 200,200"/>`,
      gyronny: `<polygon points="0,0 200,200 200,100 0,100"/><polygon points="200,0 0,200 100,200 100,0"/>`,
      chevronny: `<path d="M0,80 100,-15 200,80 200,120 100,25 0,120z M0,160 100,65 200,160 200,200 100,105 0,200z M0,240 100,145 200,240 0,240z"/>`,
      // lined divisions
      perFessLined: line => `<path d="${line}"/><rect x="0" y="115" width="200" height="85" shape-rendering="crispedges"/>`,
      perPaleLined: line => `<path d="${line}" transform="rotate(-90 100 100)"/><rect x="115" y="0" width="85" height="200" shape-rendering="crispedges"/>`,
      perBendLined: line => `<path d="${line}" transform="translate(-10 -10) rotate(45 110 110) scale(1.1)"/><rect x="0" y="115" width="200" height="85" transform="translate(-10 -10) rotate(45 110 110) scale(1.1)" shape-rendering="crispedges"/>`,
      perBendSinisterLined: line => `<path d="${line}" transform="translate(-10 -10) rotate(-45 110 110) scale(1.1)"/><rect x="0" y="115" width="200" height="85" transform="translate(-10 -10) rotate(-45 110 110) scale(1.1)" shape-rendering="crispedges"/>`,
      perChevronLined: line => `<rect x="15" y="115" width="200" height="200" transform="translate(70 70) rotate(45 100 100)"/><path d="${line}" transform="translate(129 71) rotate(-45 -100 100) scale(-1 1)"/><path d="${line}" transform="translate(71 71) rotate(45 100 100)"/>`,
      perChevronReversedLined: line => `<rect x="15" y="115" width="200" height="200" transform="translate(-70 -70) rotate(225.001 100 100)"/><path d="${line}" transform="translate(-70.7 -70.7) rotate(225 100 100) scale(1 1)"/><path d="${line}" transform="translate(270.7 -70.7) rotate(-225 -100 100) scale(-1 1)"/>`,
      perCrossLined: line => `<rect x="100" y="0" width="100" height="92.5"/><rect x="0" y="107.5" width="100" height="92.5"/><path d="${line}" transform="translate(0 50) scale(.5001)"/><path d="${line}" transform="translate(200 150) scale(-.5)"/>`,
      perPileLined: line => `<path d="${line}" transform="translate(161.66 10) rotate(66.66 -100 100) scale(-1 1)"/><path d="${line}" transform="translate(38.33 10) rotate(-66.66 100 100)"/><polygon points="-2.15,0 84.15,200 115.85,200 202.15,0 200,200 0,200"/>`,
      // straight ordinaries
      fess: `<rect x="0" y="75" width="200" height="50"/>`,
      pale: `<rect x="75" y="0" width="50" height="200"/>`,
      bend: `<polygon points="35,0 200,165 200,200 165,200 0,35 0,0"/>`,
      bendSinister: `<polygon points="0,165 165,0 200,0 200,35 35,200 0,200"/>`,
      chief: `<rect width="200" height="75"/>`,
      bar: `<rect x="0" y="87.5" width="200" height="25"/>`,
      gemelle: `<rect x="0" y="76" width="200" height="16"/><rect x="0" y="108" width="200" height="16"/>`,
      fessCotissed: `<rect x="0" y="67" width="200" height="8"/><rect x="0" y="83" width="200" height="34"/><rect x="0" y="125" width="200" height="8"/>`,
      fessDoubleCotissed: `<rect x="0" y="60" width="200" height="7.5"/><rect x="0" y="72.5" width="200" height="7.5"/><rect x="0" y="85" width="200" height="30"/><rect x="0" y="120" width="200" height="7.5"/><rect x="0" y="132.5" width="200" height="7.5"/>`,
      bendlet: `<polygon points="22,0 200,178 200,200 178,200 0,22 0,0"/>`,
      bendletSinister: `<polygon points="0,178 178,0 200,0 200,22 22,200 0,200"/>`,
      terrace: `<rect x="0" y="145" width="200" height="55"/>`,
      cross: `<polygon points="85,0 85,85 0,85 0,115 85,115 85,200 115,200 115,115 200,115 200,85 115,85 115,0"/>`,
      crossParted: `<path d="M 80 0 L 80 80 L 0 80 L 0 95 L 80 95 L 80 105 L 0 105 L 0 120 L 80 120 L 80 200 L 95 200 L 95 120 L 105 120 L 105 200 L 120 200 L 120 120 L 200 120 L 200 105 L 120 105 L 120 95 L 200 95 L 200 80 L 120 80 L 120 0 L 105 0 L 105 80 L 95 80 L 95 0 L 80 0 z M 95 95 L 105 95 L 105 105 L 95 105 L 95 95 z"/>`,
      saltire: `<path d="M 0,21 79,100 0,179 0,200 21,200 100,121 179,200 200,200 200,179 121,100 200,21 200,0 179,0 100,79 21,0 0,0 Z"/>`,
      saltireParted: `<path d="M 7 0 L 89 82 L 82 89 L 0 7 L 0 28 L 72 100 L 0 172 L 0 193 L 82 111 L 89 118 L 7 200 L 28 200 L 100 128 L 172 200 L 193 200 L 111 118 L 118 111 L 200 193 L 200 172 L 128 100 L 200 28 L 200 7 L 118 89 L 111 82 L 193 0 L 172 0 L 100 72 L 28 0 L 7 0 z M 100 93 L 107 100 L 100 107 L 93 100 L 100 93 z"/>`,
      mount: `<path d="m0,250 a100,100,0,0,1,200,0"/>`,
      point: `<path d="M0,200 Q80,180 100,135 Q120,180 200,200"/>`,
      flaunches: `<path d="M0,0 q120,100 0,200 M200,0 q-120,100 0,200"/>`,
      gore: `<path d="M20,0 Q30,75 100,100 Q80,150 100,200 L0,200 L0,0 Z"/>`,
      pall: `<polygon points="0,0 30,0 100,70 170,0 200,0 200,30 122,109 122,200 78,200 78,109 0,30"/>`,
      pallReversed: `<polygon points="0,200 0,170 78,91 78,0 122,0 122,91 200,170 200,200 170,200 100,130 30,200"/>`,
      chevron: `<polygon points="0,125 100,60 200,125 200,165 100,100 0,165"/>`,
      chevronReversed: `<polygon points="0,75 100,140 200,75 200,35 100,100 0,35"/>`,
      gyron: `<polygon points="0,0 100,100 0,100"/>`,
      quarter: `<rect width="50%" height="50%"/>`,
      canton: `<rect width="37.5%" height="37.5%"/>`,
      pile: `<polygon points="70,0 100,175 130,0"/>`,
      pileInBend: `<polygon points="200,200 200,144 25,25 145,200"/>`,
      pileInBendSinister: `<polygon points="0,200 0,144 175,25 55,200"/>`,
      piles: `<polygon points="46,0 75,175 103,0"/><polygon points="95,0 125,175 154,0"/>`,
      pilesInPoint: `<path d="M15,0 100,200 60,0Z M80,0 100,200 120,0Z M140,0 100,200 185,0Z"/>`,
      label: `<path d="m 46,54.8 6.6,-15.6 95.1,0 5.9,15.5 -16.8,0.1 4.5,-11.8 L 104,43 l 4.3,11.9 -16.8,0 4.3,-11.8 -37.2,0 4.5,11.8 -16.9,0 z"/>`,
      // lined ordinaries
      fessLined: line => `<path d="${line}" transform="translate(0 -25)"/><path d="${line}" transform="translate(0 25) rotate(180 100 100)"/><rect x="0" y="88" width="200" height="24" stroke="none"/>`,
      paleLined: line => `<path d="${line}" transform="rotate(-90 100 100) translate(0 -25)"/><path d="${line}" transform="rotate(90 100 100) translate(0 -25)"/><rect x="88" y="0" width="24" height="200" stroke="none"/>`,
      bendLined: line => `<path d="${line}" transform="translate(8 -18) rotate(45 110 100) scale(1.1 1)"/><path d="${line}" transform="translate(-28 18) rotate(225 110 100) scale(1.1 1)"/><rect x="0" y="88" width="200" height="24" transform="translate(-10 0) rotate(45 110 100) scale(1.1 1)" stroke="none"/>`,
      bendSinisterLined: line => `<path d="${line}" transform="translate(-28 -18) rotate(-45 110 100) scale(1.1 1)"/><path d="${line}" transform="translate(8 18) rotate(-225 110 100) scale(1.1 1)"/><rect x="0" y="88" width="200" height="24" transform="translate(-10 0) rotate(-45 110 100) scale(1.1 1)" stroke="none"/>`,
      chiefLined: line => `<path d="${line}" transform="translate(0,-25) rotate(180.00001 100 100)"/><rect width="200" height="62" stroke="none"/>`,
      barLined: line => `<path d="${line}" transform="translate(0,-12.5)"/><path d="${line}" transform="translate(0,12.5) rotate(180.00001 100 100)"/><rect x="0" y="94" width="200" height="12" stroke="none"/>`,
      gemelleLined: line => `<path d="${line}" transform="translate(0,-22.5)"/><path d="${line}" transform="translate(0,22.5) rotate(180.00001 100 100)"/>`,
      fessCotissedLined: line => `<path d="${line}" transform="translate(0 15) scale(1 .5)"/><path d="${line}" transform="translate(0 85) rotate(180 100 50) scale(1 .5)"/><rect x="0" y="80" width="200" height="40"/>`,
      fessDoubleCotissedLined: line => `<rect x="0" y="85" width="200" height="30"/><rect x="0" y="72.5" width="200" height="7.5"/><rect x="0" y="120" width="200" height="7.5"/><path d="${line}" transform="translate(0 10) scale(1 .5)"/><path d="${line}" transform="translate(0 90) rotate(180 100 50) scale(1 .5)"/>`,
      bendletLined: line => `<path d="${line}" transform="translate(2 -12) rotate(45 110 100) scale(1.1 1)"/><path d="${line}" transform="translate(-22 12) rotate(225 110 100) scale(1.1 1)"/><rect x="0" y="94" width="200" height="12" transform="translate(-10 0) rotate(45 110 100) scale(1.1 1)" stroke="none"/>`,
      bendletSinisterLined: line => `<path d="${line}" transform="translate(-22 -12) rotate(-45 110 100) scale(1.1 1)"/><path d="${line}" transform="translate(2 12) rotate(-225 110 100) scale(1.1 1)"/><rect x="0" y="94" width="200" height="12" transform="translate(-10 0) rotate(-45 110 100) scale(1.1 1)" stroke="none"/>`,
      terraceLined: line => `<path d="${line}" transform="translate(0,50)"/><rect x="0" y="164" width="200" height="36" stroke="none"/>`,
      crossLined: line => `<path d="${line}" transform="translate(0 -14.5)"/><path d="${line}" transform="rotate(180 100 100) translate(0 -14.5)"/><path d="${line}" transform="rotate(-90 100 100) translate(0 -14.5)"/><path d="${line}" transform="rotate(-270 100 100) translate(0 -14.5)"/>`,
      crossPartedLined: line => `<path d="${line}" transform="translate(0 -20)"/><path d="${line}" transform="rotate(180 100 100) translate(0 -20)"/><path d="${line}" transform="rotate(-90 100 100) translate(0 -20)"/><path d="${line}" transform="rotate(-270 100 100) translate(0 -20)"/>`,
      saltireLined: line => `<path d="${line}" transform="translate(0 -10) rotate(45 110 100) scale(1.1 1)"/><path d="${line}" transform="translate(-20 10) rotate(225 110 100) scale(1.1 1)"/><path d="${line}" transform="translate(-20 -10) rotate(-45 110 100) scale(1.1 1)"/><path d="${line}" transform="translate(0 10) rotate(-225 110 100) scale(1.1 1)"/>`,
      saltirePartedLined: line => `<path d="${line}" transform="translate(3 -13) rotate(45 110 100) scale(1.1 1)"/><path d="${line}" transform="translate(-23 13) rotate(225 110 100) scale(1.1 1)"/><path d="${line}" transform="translate(-23 -13) rotate(-45 110 100) scale(1.1 1)"/><path d="${line}" transform="translate(3 13) rotate(-225 110 100) scale(1.1 1)"/>`
    };

    const patterns = {
      semy: (p, c1, c2, size, chargeId) => `<pattern id="${p}" width="${size * .125}" height="${size * .125}" viewBox="0 0 200 200" stroke="#000"><rect width="200" height="200" fill="${c1}" stroke="none"/><g fill="${c2}"><use transform="translate(-100 -50)" href="#${chargeId}"/><use transform="translate(100 -50)" href="#${chargeId}"/><use transform="translate(0 50)" href="#${chargeId}"/></g></pattern>`,
      vair: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .25}" viewBox="0 0 25 50" stroke="#000" stroke-width=".2"><rect width="25" height="25" fill="${c1}" stroke="none"/><path d="m12.5,0 l6.25,6.25 v12.5 l6.25,6.25 h-25 l6.25,-6.25 v-12.5 z" fill="${c2}"/><rect x="0" y="25" width="25" height="25" fill="${c2}" stroke="none"/><path d="m25,25 l-6.25,6.25 v12.5 l-6.25,6.25 l-6.25,-6.25 v-12.5 l-6.25,-6.25 z" fill="${c1}"/><path d="M0 50 h25" fill="none"/></pattern>`,
      counterVair: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .25}" viewBox="0 0 25 50" stroke="#000" stroke-width=".2"><rect width="25" height="50" fill="${c2}" stroke="none"/><path d="m 12.5,0 6.25,6.25 v 12.5 L 25,25 18.75,31.25 v 12.5 L 12.5,50 6.25,43.75 V 31.25 L 0,25 6.25,18.75 V 6.25 Z" fill="${c1}"/></pattern>`,
      vairInPale: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .125}" viewBox="0 0 25 25"><rect width="25" height="25" fill="${c1}"/><path d="m12.5,0 l6.25,6.25 v12.5 l6.25,6.25 h-25 l6.25,-6.25 v-12.5 z" fill="${c2}" stroke="#000" stroke-width=".2"/></pattern>`,
      vairEnPointe: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .25}" viewBox="0 0 25 50"><rect width="25" height="25" fill="${c2}"/><path d="m12.5,0 l6.25,6.25 v12.5 l6.25,6.25 h-25 l6.25,-6.25 v-12.5 z" fill="${c1}"/><rect x="0" y="25" width="25" height="25" fill="${c1}" stroke-width="1" stroke="${c1}"/><path d="m12.5,25 l6.25,6.25 v12.5 l6.25,6.25 h-25 l6.25,-6.25 v-12.5 z" fill="${c2}"/></pattern>`,
      vairAncien: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .125}" viewBox="0 0 100 100"><rect width="100" height="100" fill="${c1}"/><path fill="${c2}" stroke="none" d="m 0,90 c 10,0 25,-5 25,-40 0,-25 10,-40 25,-40 15,0 25,15 25,40 0,35 15,40 25,40 v 10 H 0 Z"/><path fill="none" stroke="#000" d="M 0,90 c 10,0 25,-5 25,-40 0,-35 15,-40 25,-40 10,0 25,5 25,40 0,35 15,40 25,40 M0,100 h100"/></pattern>`,
      potent: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .125}" viewBox="0 0 200 200" stroke="#000"><rect width="200" height="100" fill="${c1}" stroke="none"/><rect y="100" width="200" height="100" fill="${c2}" stroke="none"/><path d="m25 50h50v-50h50v50h50v50h-150z" fill="${c2}"/><path d="m25 100v50h50v50h50v-50h50v-50z" fill="${c1}"/><path d="m0 0h200 M0 100h200" fill="none"/></pattern>`,
      counterPotent: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .125}" viewBox="0 0 200 200" stroke="none"><rect width="200" height="200" fill="${c1}"/><path d="m25 50h50v-50h50v50h50v100h-50v50h-50v-50h-50v-50z" fill="${c2}"/><path d="m0 0h200 M0 100h200 M0 200h200"/></pattern>`,
      potentInPale: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .0625}" viewBox="0 0 200 100" stroke-width="1"><rect width="200" height="100" fill="${c1}" stroke="none"/><path d="m25 50h50v-50h50v50h50v50h-150z" fill="${c2}" stroke="#000"/><path d="m0 0h200 M0 100h200" fill="none" stroke="#000"/></pattern>`,
      potentEnPointe: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .125}" viewBox="0 0 200 200" stroke="none"><rect width="200" height="200" fill="${c1}"/><path d="m0 0h25v50h50v50h50v-50h50v-50h25v100h-25v50h-50v50h-50v-50h-50v-50h-25v-100" fill="${c2}"/></pattern>`,
      ermine: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .125}" viewBox="0 0 200 200" fill="${c2}"><rect width="200" height="200" fill="${c1}"/><g stroke="none" fill="${c2}"><g transform="translate(-100 -50)"><path d="m100 81.1c-4.25 17.6-12.7 29.8-21.2 38.9 3.65-0.607 7.9-3.04 11.5-5.47-2.42 4.86-4.86 8.51-7.3 12.7 1.82-0.607 6.07-4.86 12.7-10.9 1.21 8.51 2.42 17.6 4.25 23.6 1.82-5.47 3.04-15.2 4.25-23.6 3.65 3.65 7.3 7.9 12.7 10.9l-7.9-13.3c3.65 1.82 7.9 4.86 11.5 6.07-9.11-9.11-17-21.2-20.6-38.9z"/><path d="m82.4 81.7c-0.607-0.607-6.07 2.42-9.72-4.25 7.9 6.68 15.2-7.3 21.8 1.82 1.82 4.25-6.68 10.9-12.1 2.42z"/><path d="m117 81.7c0.607-1.21 6.07 2.42 9.11-4.86-7.3 7.3-15.2-7.3-21.2 2.42-1.82 4.25 6.68 10.9 12.1 2.42z"/><path d="m101 66.5c-1.02-0.607 3.58-4.25-3.07-8.51 5.63 7.9-10.2 10.9-1.54 17.6 3.58 2.42 12.2-2.42 4.6-9.11z"/></g><g transform="translate(100 -50)"><path d="m100 81.1c-4.25 17.6-12.7 29.8-21.2 38.9 3.65-0.607 7.9-3.04 11.5-5.47-2.42 4.86-4.86 8.51-7.3 12.7 1.82-0.607 6.07-4.86 12.7-10.9 1.21 8.51 2.42 17.6 4.25 23.6 1.82-5.47 3.04-15.2 4.25-23.6 3.65 3.65 7.3 7.9 12.7 10.9l-7.9-13.3c3.65 1.82 7.9 4.86 11.5 6.07-9.11-9.11-17-21.2-20.6-38.9z"/><path d="m82.4 81.7c-0.607-0.607-6.07 2.42-9.72-4.25 7.9 6.68 15.2-7.3 21.8 1.82 1.82 4.25-6.68 10.9-12.1 2.42z"/><path d="m117 81.7c0.607-1.21 6.07 2.42 9.11-4.86-7.3 7.3-15.2-7.3-21.2 2.42-1.82 4.25 6.68 10.9 12.1 2.42z"/><path d="m101 66.5c-1.02-0.607 3.58-4.25-3.07-8.51 5.63 7.9-10.2 10.9-1.54 17.6 3.58 2.42 12.2-2.42 4.6-9.11z"/></g><g transform="translate(0 50)"><path d="m100 81.1c-4.25 17.6-12.7 29.8-21.2 38.9 3.65-0.607 7.9-3.04 11.5-5.47-2.42 4.86-4.86 8.51-7.3 12.7 1.82-0.607 6.07-4.86 12.7-10.9 1.21 8.51 2.42 17.6 4.25 23.6 1.82-5.47 3.04-15.2 4.25-23.6 3.65 3.65 7.3 7.9 12.7 10.9l-7.9-13.3c3.65 1.82 7.9 4.86 11.5 6.07-9.11-9.11-17-21.2-20.6-38.9z"/><path d="m82.4 81.7c-0.607-0.607-6.07 2.42-9.72-4.25 7.9 6.68 15.2-7.3 21.8 1.82 1.82 4.25-6.68 10.9-12.1 2.42z"/><path d="m117 81.7c0.607-1.21 6.07 2.42 9.11-4.86-7.3 7.3-15.2-7.3-21.2 2.42-1.82 4.25 6.68 10.9 12.1 2.42z"/><path d="m101 66.5c-1.02-0.607 3.58-4.25-3.07-8.51 5.63 7.9-10.2 10.9-1.54 17.6 3.58 2.42 12.2-2.42 4.6-9.11z"/></g></g></pattern>`,
      chequy: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .25}" height="${size * .25}" viewBox="0 0 50 50" fill="${c2}"><rect width="50" height="50"/><rect width="25" height="25" fill="${c1}"/><rect x="25" y="25" width="25" height="25" fill="${c1}"/></pattern>`,
      lozengy: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .125}" viewBox="0 0 50 50"><rect width="50" height="50" fill="${c1}"/><polygon points="25,0 50,25 25,50 0,25" fill="${c2}"/></pattern>`,
      fusily: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .25}" viewBox="0 0 50 100"><rect width="50" height="100" fill="${c2}"/><polygon points="25,0 50,50 25,100 0,50" fill="${c1}"/></pattern>`,
      pally: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .5}" height="${size * .125}" viewBox="0 0 100 25"><rect width="100" height="25" fill="${c2}"/><rect x="25" y="0" width="25" height="25" fill="${c1}"/><rect x="75" y="0" width="25" height="25" fill="${c1}"/></pattern>`,
      barry: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .5}" viewBox="0 0 25 100"><rect width="25" height="100" fill="${c2}"/><rect x="0" y="25" width="25" height="25" fill="${c1}"/><rect x="0" y="75" width="25" height="25" fill="${c1}"/></pattern>`,
      gemelles: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .125}" viewBox="0 0 50 50"><rect width="50" height="50" fill="${c1}"/><rect y="5" width="50" height="10" fill="${c2}"/><rect y="40" width="50" height="10" fill="${c2}"/></pattern>`,
      bendy: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .5}" height="${size * .5}" viewBox="0 0 100 100"><rect width="100" height="100" fill="${c1}"/><polygon points="0,25 75,100 25,100 0,75" fill="${c2}"/><polygon points="25,0 75,0 100,25 100,75" fill="${c2}"/></pattern>`,
      bendySinister: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .5}" height="${size * .5}" viewBox="0 0 100 100"><rect width="100" height="100" fill="${c2}"/><polygon points="0,25 25,0 75,0 0,75" fill="${c1}"/><polygon points="25,100 100,25 100,75 75,100" fill="${c1}"/></pattern>`,
      palyBendy: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .6258}" height="${size * .3576}" viewBox="0 0 175 100"><rect y="0" x="0" width="175" height="100" fill="${c2}"/><g fill="${c1}"><path d="m0 20 35 30v50l-35-30z"/><path d="m35 0 35 30v50l-35-30z"/><path d="m70 0h23l12 10v50l-35-30z"/><path d="m70 80 23 20h-23z"/><path d="m105 60 35 30v10h-35z"/><path d="m105 0h35v40l-35-30z"/><path d="m 140,40 35,30 v 30 h -23 l -12,-10z"/><path d="M 175,0 V 20 L 152,0 Z"/></g></pattern>`,
      barryBendy: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .3572}" height="${size * .6251}" viewBox="0 0 100 175"><rect width="100" height="175" fill="${c2}"/><g fill="${c1}"><path d="m20 0 30 35h50l-30-35z"/><path d="m0 35 30 35h50l-30-35z"/><path d="m0 70v23l10 12h50l-30-35z"/><path d="m80 70 20 23v-23z"/><path d="m60 105 30 35h10v-35z"/><path d="m0 105v35h40l-30-35z"/><path d="m 40,140 30,35 h 30 v -23 l -10,-12 z"/><path d="m0 175h20l-20-23z"/></g></pattern>`,
      pappellony: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .125}" viewBox="0 0 100 100"><rect width="100" height="100" fill="${c1}"/><circle cx="0" cy="51" r="45" stroke="${c2}" fill="${c1}" stroke-width="10"/><circle cx="100" cy="51" r="45" stroke="${c2}" fill="${c1}" stroke-width="10"/><circle cx="50" cy="1" r="45" stroke="${c2}" fill="${c1}" stroke-width="10"/></pattern>`,
      pappellony2: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .125}" viewBox="0 0 100 100" stroke="#000" stroke-width="2"><rect width="100" height="100" fill="${c1}" stroke="none"/><circle cy="50" r="49" fill="${c2}"/><circle cx="100" cy="50" r="49" fill="${c2}"/><circle cx="50" cy="0" r="49" fill="${c1}"/></pattern>`,
      scaly: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .125}" viewBox="0 0 100 100" stroke="#000"><rect width="100" height="100" fill="${c1}" stroke="none"/><path d="M 0,84 C -40,84 -50,49 -50,49 -50,79 -27,99 0,99 27,99 50,79 50,49 50,49 40,84 0,84 Z" fill="${c2}"/><path d="M 100,84 C 60,84 50,49 50,49 c 0,30 23,50 50,50 27,0 50,-20 50,-50 0,0 -10,35 -50,35 z" fill="${c2}"/><path d="M 50,35 C 10,35 0,0 0,0 0,30 23,50 50,50 77,50 100,30 100,0 100,0 90,35 50,35 Z" fill="${c2}"/></pattern>`,
      plumetty: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .25}" viewBox="0 0 50 100" stroke-width=".8"><rect width="50" height="100" fill="${c2}" stroke="none"/><path fill="${c1}" stroke="none" d="M 25,100 C 44,88 49.5,74 50,50 33.5,40 25,25 25,4e-7 25,25 16.5,40 0,50 0.5,74 6,88 25,100 Z"/><path fill="none" stroke="${c2}" d="m17 40c5.363 2.692 10.7 2.641 16 0m-19 7c7.448 4.105 14.78 3.894 22 0m-27 7c6-2 10.75 3.003 16 3 5.412-0.0031 10-5 16-3m-35 9c4-7 12 3 19 2 7 1 15-9 19-2m-35 6c6-2 11 3 16 3s10-5 16-3m-30 7c8 0 8 3 14 3s7-3 14-3m-25 8c7.385 4.048 14.72 3.951 22 0m-19 8c5.455 2.766 10.78 2.566 16 0m-8 6v-78"/><g fill="none" stroke="${c1}"><path d="m42 90c2.678 1.344 5.337 2.004 8 2m-11 5c3.686 2.032 7.344 3.006 10.97 3m0.0261-1.2e-4v-30"/><path d="m0 92c2.689 0.0045 5.328-0.6687 8-2m-8 10c3.709-0.0033 7.348-1.031 11-3m-11 3v-30"/><path d="m0 7c5.412-0.0031 10-5 16-3m-16 11c7 1 15-9 19-2m-19 9c5 0 10-5 16-3m-16 10c6 0 7-3 14-3m-14.02 11c3.685-0.002185 7.357-1.014 11.02-3m-11 10c2.694-0.01117 5.358-0.7036 7.996-2m-8 6v-48"/><path d="m34 4c6-2 10.75 3.003 16 3m-19 6c4-7 12 3 19 2m-16 4c6-2 11 3 16 3m-14 4c8 0 8 3 14 3m-11 5c3.641 1.996 7.383 2.985 11 3m-8 5c2.762 1.401 5.303 2.154 8.002 2.112m-0.00154 3.888v-48"/></g></pattern>`,
      masoned: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .125}" height="${size * .125}" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="${c1}"/><rect width="100" height="50" stroke="${c2}" stroke-width="4"/><line x1="50" y1="50" x2="50" y2="100" stroke="${c2}" stroke-width="5"/></pattern>`,
      fretty: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .2}" height="${size * .2}" viewBox="0 0 140 140" stroke="#000" stroke-width="2"><rect width="140" height="140" fill="${c1}" stroke="none"/><path d="m-15 5 150 150 20-20-150-150z" fill="${c2}"/><path d="m10 150 140-140-20-20-140 140z" fill="${c2}" stroke="none"/><path d="m0 120 20 20 120-120-20-20z" fill="none"/></pattern>`,
      grillage: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .25}" height="${size * .25}" viewBox="0 0 200 200" stroke="#000" stroke-width="2"><rect width="200" height="200" fill="${c1}" stroke="none"/><path d="m205 65v-30h-210v30z" fill="${c2}"/><path d="m65-5h-30v210h30z" fill="${c2}"/><path d="m205 165v-30h-210v30z" fill="${c2}"/><path d="m165,65h-30v140h30z" fill="${c2}"/><path d="m 165,-5h-30v40h30z" fill="${c2}"/></pattern>`,
      chainy: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .167}" height="${size * .167}" viewBox="0 0 200 200" stroke="#000" stroke-width="2"><rect x="-6.691e-6" width="200" height="200" fill="${c1}" stroke="none"/><path d="m155-5-20-20-160 160 20 20z" fill="${c2}"/><path d="m45 205 160-160 20 20-160 160z" fill="${c2}"/><path d="m45-5 20-20 160 160-20 20-160-160" fill="${c2}"/><path d="m-5 45-20 20 160 160 20-20-160-160" fill="${c2}"/></pattern>`,
      maily: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .167}" height="${size * .167}" viewBox="0 0 200 200" stroke="#000" stroke-width="1.2"><path fill="${c1}" stroke="none" d="M0 0h200v200H0z"/><g fill="${c2}"><path d="m80-2c-5.27e-4 2.403-0.1094 6.806-0.3262 9.199 5.014-1.109 10.1-1.768 15.19-2.059 0.09325-1.712 0.1401-5.426 0.1406-7.141z"/><path d="m100 5a95 95 0 0 0-95 95 95 95 0 0 0 95 95 95 95 0 0 0 95-95 95 95 0 0 0-95-95zm0 15a80 80 0 0 1 80 80 80 80 0 0 1-80 80 80 80 0 0 1-80-80 80 80 0 0 1 80-80z"/><path d="m92.8 20.33c-5.562 0.4859-11.04 1.603-16.34 3.217-7.793 25.31-27.61 45.12-52.91 52.91-5.321 1.638-10.8 2.716-16.34 3.217-2.394 0.2168-6.796 0.3256-9.199 0.3262v15c1.714-4.79e-4 5.429-0.04737 7.141-0.1406 5.109-0.2761 10.19-0.9646 15.19-2.059 36.24-7.937 64.54-36.24 72.47-72.47z"/><path d="m202 80c-2.403-5.31e-4 -6.806-0.1094-9.199-0.3262 1.109 5.014 1.768 10.1 2.059 15.19 1.712 0.09326 5.426 0.1401 7.141 0.1406z"/><path d="m179.7 92.8c-0.4859-5.562-1.603-11.04-3.217-16.34-25.31-7.793-45.12-27.61-52.91-52.91-1.638-5.321-2.716-10.8-3.217-16.34-0.2168-2.394-0.3256-6.796-0.3262-9.199h-15c4.8e-4 1.714 0.0474 5.429 0.1406 7.141 0.2761 5.109 0.9646 10.19 2.059 15.19 7.937 36.24 36.24 64.54 72.47 72.47z"/><path d="m120 202c5.3e-4 -2.403 0.1094-6.806 0.3262-9.199-5.014 1.109-10.1 1.768-15.19 2.059-0.0933 1.712-0.1402 5.426-0.1406 7.141z"/><path d="m107.2 179.7c5.562-0.4859 11.04-1.603 16.34-3.217 7.793-25.31 27.61-45.12 52.91-52.91 5.321-1.638 10.8-2.716 16.34-3.217 2.394-0.2168 6.796-0.3256 9.199-0.3262v-15c-1.714 4.7e-4 -5.429 0.0474-7.141 0.1406-5.109 0.2761-10.19 0.9646-15.19 2.059-36.24 7.937-64.54 36.24-72.47 72.47z"/><path d="m -2,120 c 2.403,5.4e-4 6.806,0.1094 9.199,0.3262 -1.109,-5.014 -1.768,-10.1 -2.059,-15.19 -1.712,-0.0933 -5.426,-0.1402 -7.141,-0.1406 z"/><path d="m 20.33,107.2 c 0.4859,5.562 1.603,11.04 3.217,16.34 25.31,7.793 45.12,27.61 52.91,52.91 1.638,5.321 2.716,10.8 3.217,16.34 0.2168,2.394 0.3256,6.796 0.3262,9.199 L 95,202 c -4.8e-4,-1.714 -0.0472,-5.44 -0.1404,-7.152 -0.2761,-5.109 -0.9646,-10.19 -2.059,-15.19 -7.937,-36.24 -36.24,-64.54 -72.47,-72.47 z"/></g></pattern>`,
      honeycombed: (p, c1, c2, size) => `<pattern id="${p}" width="${size * .143}" height="${size * .24514}" viewBox="0 0 70 120"><rect width="70" height="120" fill="${c1}"/><path d="M 70,0 V 20 L 35,40 m 35,80 V 100 L 35,80 M 0,120 V 100 L 35,80 V 40 L 0,20 V 0" stroke="${c2}" fill="none" stroke-width="3"/></pattern>`
    };

    const chargesGroup = document.getElementById("charges");
    const colorsData = get_store_value(colors);
    const loadedCharges = {};

    const getTemplate = (id, line) => {
      const linedId = id + "Lined";
      if (!line || line === "straight" || !templates[linedId]) return templates[id];
      const linePath = lines[line];
      return templates[linedId](linePath);
    };

    const addPattern = patternId => {
      if (document.getElementById(patternId)) return; // already added;

      const [pattern, t1, t2, size] = patternId.split("-");
      const charge = semy(patternId);
      if (charge) addCharge(charge);

      const html = patterns[charge ? "semy" : pattern](patternId, clr(t1), clr(t2), getSizeMod(size), charge);
      document.getElementById("patterns").insertAdjacentHTML("beforeend", html);
    };

    function semy(string) {
      const isSemy = /^semy/.test(string);
      if (!isSemy) return false;
      return string.match(/semy_of_(.*?)-/)[1];
    }

    function addCharge(charge) {
      charge.slice(0, 12) === "inescutcheon" ? addInescutcheon(charge) : fetchCharge(charge);
    }

    function addInescutcheon(charge) {
      const shieldName = charge.length > 12 ? charge.slice(12, 13).toLowerCase() + charge.slice(13) : get_store_value(shield);
      const id = charge.length > 12 ? charge : "inescutcheon" + shieldName.charAt(0).toUpperCase() + shieldName.slice(1);

      if (loadedCharges[id]) return; // already added
      loadedCharges[id] = true;

      const licenseAttrs = ["noldor", "gondor", "easterling", "ironHills", "urukHai", "moriaOrc"].includes(shieldName)
        ? `author="Weta Workshop" source="www.wetanz.com" license="https://en.wikipedia.org/wiki/Fair_use"`
        : `author=Azgaar license="https://creativecommons.org/publicdomain/zero/1.0"`;
      const g = `<g id=${id} ${licenseAttrs}><path transform="translate(67 67) scale(.33)" d="${shieldPaths[shieldName]}"/></g>`;
      chargesGroup.insertAdjacentHTML("beforeend", g);
    }

    function fetchCharge(charge) {
      if (loadedCharges[charge]) return; // already added
      loadedCharges[charge] = true;

      fetch("charges/" + charge + ".svg")
        .then(res => {
          if (res.ok) return res.text();
          else throw new Error("Cannot fetch charge");
        })
        .then(text => {
          const el = document.createElement("html");
          el.innerHTML = text;
          const g = el.querySelector("g");
          const metadata = el.getElementsByTagName("metadata")[0];

          if (metadata) {
            const author = metadata.getAttribute("author");
            const source = metadata.getAttribute("source");
            const license = metadata.getAttribute("license");
            if (author) g.setAttribute("author", author);
            if (source) g.setAttribute("source", source);
            if (license) g.setAttribute("license", license);
          }

          chargesGroup.insertAdjacentHTML("beforeend", g.outerHTML);
        })
        .catch(err => console.error(err));
    }

    function clr(tincture) {
      if (!colorsData[tincture]) throw new error(`Tincture ${tincture} is not available in ${tincture}`);
      return colorsData[tincture];
    }

    function getSizeMod(size) {
      if (size === "small") return 0.8;
      if (size === "smaller") return 0.5;
      if (size === "smallest") return 0.25;
      if (size === "big") return 1.6;
      if (size === "bigger") return 2;
      return 1;
    }

    /* src\components\object\Ordinary.svelte generated by Svelte v3.44.2 */
    const file$u = "src\\components\\object\\Ordinary.svelte";

    // (26:0) {:else}
    function create_else_block$5(ctx) {
    	let g;
    	let raw_value = getTemplate(/*ordinary*/ ctx[0].ordinary, /*ordinary*/ ctx[0].line) + "";
    	let g_transform_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			attr_dev(g, "class", "ordinary");
    			attr_dev(g, "i", /*i*/ ctx[1]);
    			attr_dev(g, "transform", g_transform_value = transform(/*ordinary*/ ctx[0]));
    			attr_dev(g, "fill", /*t*/ ctx[3]);
    			attr_dev(g, "stroke", /*stroke*/ ctx[4]);
    			attr_dev(g, "stroke-width", /*width*/ ctx[5]);
    			add_location(g, file$u, 26, 2, 850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			g.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = listen_dev(g, "mousedown", /*addDrag*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ordinary*/ 1 && raw_value !== (raw_value = getTemplate(/*ordinary*/ ctx[0].ordinary, /*ordinary*/ ctx[0].line) + "")) g.innerHTML = raw_value;
    			if (dirty & /*i*/ 2) {
    				attr_dev(g, "i", /*i*/ ctx[1]);
    			}

    			if (dirty & /*ordinary*/ 1 && g_transform_value !== (g_transform_value = transform(/*ordinary*/ ctx[0]))) {
    				attr_dev(g, "transform", g_transform_value);
    			}

    			if (dirty & /*t*/ 8) {
    				attr_dev(g, "fill", /*t*/ ctx[3]);
    			}

    			if (dirty & /*stroke*/ 16) {
    				attr_dev(g, "stroke", /*stroke*/ ctx[4]);
    			}

    			if (dirty & /*width*/ 32) {
    				attr_dev(g, "stroke-width", /*width*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(26:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:39) 
    function create_if_block_1$6(ctx) {
    	let g;
    	let path;
    	let g_transform_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", /*shieldPath*/ ctx[2]);
    			attr_dev(path, "fill", "none");
    			attr_dev(path, "stroke", /*t*/ ctx[3]);
    			attr_dev(path, "stroke-width", "5%");
    			attr_dev(path, "transform", "translate(15 15) scale(.85)");
    			add_location(path, file$u, 23, 4, 725);
    			attr_dev(g, "class", "ordinary");
    			attr_dev(g, "i", /*i*/ ctx[1]);
    			attr_dev(g, "transform", g_transform_value = transform(/*ordinary*/ ctx[0]));
    			add_location(g, file$u, 22, 2, 640);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, path);

    			if (!mounted) {
    				dispose = listen_dev(g, "mousedown", /*addDrag*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*shieldPath*/ 4) {
    				attr_dev(path, "d", /*shieldPath*/ ctx[2]);
    			}

    			if (dirty & /*t*/ 8) {
    				attr_dev(path, "stroke", /*t*/ ctx[3]);
    			}

    			if (dirty & /*i*/ 2) {
    				attr_dev(g, "i", /*i*/ ctx[1]);
    			}

    			if (dirty & /*ordinary*/ 1 && g_transform_value !== (g_transform_value = transform(/*ordinary*/ ctx[0]))) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(22:39) ",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#if ordinary.ordinary === "bordure"}
    function create_if_block$d(ctx) {
    	let g;
    	let path;
    	let g_transform_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", /*shieldPath*/ ctx[2]);
    			attr_dev(path, "fill", "none");
    			attr_dev(path, "stroke", /*t*/ ctx[3]);
    			attr_dev(path, "stroke-width", "16.7%");
    			add_location(path, file$u, 19, 4, 520);
    			attr_dev(g, "class", "ordinary");
    			attr_dev(g, "i", /*i*/ ctx[1]);
    			attr_dev(g, "transform", g_transform_value = transform(/*ordinary*/ ctx[0]));
    			add_location(g, file$u, 18, 2, 435);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, path);

    			if (!mounted) {
    				dispose = listen_dev(g, "mousedown", /*addDrag*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*shieldPath*/ 4) {
    				attr_dev(path, "d", /*shieldPath*/ ctx[2]);
    			}

    			if (dirty & /*t*/ 8) {
    				attr_dev(path, "stroke", /*t*/ ctx[3]);
    			}

    			if (dirty & /*i*/ 2) {
    				attr_dev(g, "i", /*i*/ ctx[1]);
    			}

    			if (dirty & /*ordinary*/ 1 && g_transform_value !== (g_transform_value = transform(/*ordinary*/ ctx[0]))) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(18:0) {#if ordinary.ordinary === \\\"bordure\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$u(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*ordinary*/ ctx[0].ordinary === "bordure") return create_if_block$d;
    		if (/*ordinary*/ ctx[0].ordinary === "orle") return create_if_block_1$6;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Ordinary', slots, []);
    	let { coa, ordinary, i, shieldPath, t, type } = $$props;
    	let stroke, width;

    	function addDrag(event) {
    		if (type !== "Edit") return;
    		drag(event, ordinary, coa);
    	}

    	const writable_props = ['coa', 'ordinary', 'i', 'shieldPath', 't', 'type'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Ordinary> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('coa' in $$props) $$invalidate(7, coa = $$props.coa);
    		if ('ordinary' in $$props) $$invalidate(0, ordinary = $$props.ordinary);
    		if ('i' in $$props) $$invalidate(1, i = $$props.i);
    		if ('shieldPath' in $$props) $$invalidate(2, shieldPath = $$props.shieldPath);
    		if ('t' in $$props) $$invalidate(3, t = $$props.t);
    		if ('type' in $$props) $$invalidate(8, type = $$props.type);
    	};

    	$$self.$capture_state = () => ({
    		drag,
    		transform,
    		getTemplate,
    		coa,
    		ordinary,
    		i,
    		shieldPath,
    		t,
    		type,
    		stroke,
    		width,
    		addDrag
    	});

    	$$self.$inject_state = $$props => {
    		if ('coa' in $$props) $$invalidate(7, coa = $$props.coa);
    		if ('ordinary' in $$props) $$invalidate(0, ordinary = $$props.ordinary);
    		if ('i' in $$props) $$invalidate(1, i = $$props.i);
    		if ('shieldPath' in $$props) $$invalidate(2, shieldPath = $$props.shieldPath);
    		if ('t' in $$props) $$invalidate(3, t = $$props.t);
    		if ('type' in $$props) $$invalidate(8, type = $$props.type);
    		if ('stroke' in $$props) $$invalidate(4, stroke = $$props.stroke);
    		if ('width' in $$props) $$invalidate(5, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*ordinary*/ 1) {
    			{
    				$$invalidate(4, stroke = ordinary.stroke || "none");
    				$$invalidate(5, width = ordinary.strokeWidth || 1);
    			}
    		}
    	};

    	return [ordinary, i, shieldPath, t, stroke, width, addDrag, coa, type];
    }

    class Ordinary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {
    			coa: 7,
    			ordinary: 0,
    			i: 1,
    			shieldPath: 2,
    			t: 3,
    			type: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ordinary",
    			options,
    			id: create_fragment$u.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*coa*/ ctx[7] === undefined && !('coa' in props)) {
    			console.warn("<Ordinary> was created without expected prop 'coa'");
    		}

    		if (/*ordinary*/ ctx[0] === undefined && !('ordinary' in props)) {
    			console.warn("<Ordinary> was created without expected prop 'ordinary'");
    		}

    		if (/*i*/ ctx[1] === undefined && !('i' in props)) {
    			console.warn("<Ordinary> was created without expected prop 'i'");
    		}

    		if (/*shieldPath*/ ctx[2] === undefined && !('shieldPath' in props)) {
    			console.warn("<Ordinary> was created without expected prop 'shieldPath'");
    		}

    		if (/*t*/ ctx[3] === undefined && !('t' in props)) {
    			console.warn("<Ordinary> was created without expected prop 't'");
    		}

    		if (/*type*/ ctx[8] === undefined && !('type' in props)) {
    			console.warn("<Ordinary> was created without expected prop 'type'");
    		}
    	}

    	get coa() {
    		throw new Error("<Ordinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set coa(value) {
    		throw new Error("<Ordinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ordinary() {
    		throw new Error("<Ordinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ordinary(value) {
    		throw new Error("<Ordinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get i() {
    		throw new Error("<Ordinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set i(value) {
    		throw new Error("<Ordinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shieldPath() {
    		throw new Error("<Ordinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shieldPath(value) {
    		throw new Error("<Ordinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t() {
    		throw new Error("<Ordinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t(value) {
    		throw new Error("<Ordinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Ordinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Ordinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\object\Charge.svelte generated by Svelte v3.44.2 */
    const file$t = "src\\components\\object\\Charge.svelte";

    function get_each_context$e(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (41:2) {#each [...new Set(charge.p)].filter(p => positions[p]) as p}
    function create_each_block$e(ctx) {
    	let use;
    	let use_xlink_href_value;
    	let use_transform_value;

    	const block = {
    		c: function create() {
    			use = svg_element("use");
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#" + /*chargeId*/ ctx[3]);
    			attr_dev(use, "transform", use_transform_value = /*getElTransform*/ ctx[6](/*charge*/ ctx[0], /*p*/ ctx[13]));
    			add_location(use, file$t, 41, 4, 1504);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, use, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*chargeId*/ 8 && use_xlink_href_value !== (use_xlink_href_value = "#" + /*chargeId*/ ctx[3])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}

    			if (dirty & /*charge, positions*/ 17 && use_transform_value !== (use_transform_value = /*getElTransform*/ ctx[6](/*charge*/ ctx[0], /*p*/ ctx[13]))) {
    				attr_dev(use, "transform", use_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(use);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$e.name,
    		type: "each",
    		source: "(41:2) {#each [...new Set(charge.p)].filter(p => positions[p]) as p}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let g;
    	let g_transform_value;
    	let mounted;
    	let dispose;
    	let each_value = [...new Set(/*charge*/ ctx[0].p)].filter(/*func*/ ctx[11]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$e(get_each_context$e(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "charge");
    			attr_dev(g, "i", /*i*/ ctx[1]);
    			attr_dev(g, "charge", /*chargeId*/ ctx[3]);
    			attr_dev(g, "fill", /*t*/ ctx[2]);
    			attr_dev(g, "transform", g_transform_value = transform(/*charge*/ ctx[0]));
    			attr_dev(g, "stroke", /*stroke*/ ctx[5]);
    			add_location(g, file$t, 39, 0, 1322);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(g, "mousedown", /*addDrag*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*chargeId, getElTransform, charge, Set, positions*/ 89) {
    				each_value = [...new Set(/*charge*/ ctx[0].p)].filter(/*func*/ ctx[11]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$e(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$e(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*i*/ 2) {
    				attr_dev(g, "i", /*i*/ ctx[1]);
    			}

    			if (dirty & /*chargeId*/ 8) {
    				attr_dev(g, "charge", /*chargeId*/ ctx[3]);
    			}

    			if (dirty & /*t*/ 4) {
    				attr_dev(g, "fill", /*t*/ ctx[2]);
    			}

    			if (dirty & /*charge*/ 1 && g_transform_value !== (g_transform_value = transform(/*charge*/ ctx[0]))) {
    				attr_dev(g, "transform", g_transform_value);
    			}

    			if (dirty & /*stroke*/ 32) {
    				attr_dev(g, "stroke", /*stroke*/ ctx[5]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function round(n) {
    	return Math.round(n * 100) / 100;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Charge', slots, []);
    	let { coa, charge, i, shield, t, type } = $$props;
    	let chargeId, positions, sizeModifier, stroke;

    	function getElTransform(c, p) {
    		const s = round((c.size || 1) * sizeModifier);
    		const sx = c.sinister ? -s : s;
    		const sy = c.reversed ? -s : s;
    		let [x, y] = positions[p];
    		x = round(x - 100 * (sx - 1));
    		y = round(y - 100 * (sy - 1));
    		const translate = x || y ? `translate(${x} ${y})` : null;

    		const scale = sx !== 1 || sy !== 1
    		? sx === sy ? `scale(${sx})` : `scale(${sx} ${sy})`
    		: null;

    		return translate && scale
    		? `${translate} ${scale}`
    		: translate ? translate : scale ? scale : null;
    	}

    	function addDrag(event) {
    		if (type !== "Edit") return;
    		drag(event, charge, coa);
    	}

    	const writable_props = ['coa', 'charge', 'i', 'shield', 't', 'type'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Charge> was created with unknown prop '${key}'`);
    	});

    	const func = p => positions[p];

    	$$self.$$set = $$props => {
    		if ('coa' in $$props) $$invalidate(8, coa = $$props.coa);
    		if ('charge' in $$props) $$invalidate(0, charge = $$props.charge);
    		if ('i' in $$props) $$invalidate(1, i = $$props.i);
    		if ('shield' in $$props) $$invalidate(9, shield = $$props.shield);
    		if ('t' in $$props) $$invalidate(2, t = $$props.t);
    		if ('type' in $$props) $$invalidate(10, type = $$props.type);
    	};

    	$$self.$capture_state = () => ({
    		shieldPositions,
    		shieldSize,
    		drag,
    		transform,
    		coa,
    		charge,
    		i,
    		shield,
    		t,
    		type,
    		chargeId,
    		positions,
    		sizeModifier,
    		stroke,
    		round,
    		getElTransform,
    		addDrag
    	});

    	$$self.$inject_state = $$props => {
    		if ('coa' in $$props) $$invalidate(8, coa = $$props.coa);
    		if ('charge' in $$props) $$invalidate(0, charge = $$props.charge);
    		if ('i' in $$props) $$invalidate(1, i = $$props.i);
    		if ('shield' in $$props) $$invalidate(9, shield = $$props.shield);
    		if ('t' in $$props) $$invalidate(2, t = $$props.t);
    		if ('type' in $$props) $$invalidate(10, type = $$props.type);
    		if ('chargeId' in $$props) $$invalidate(3, chargeId = $$props.chargeId);
    		if ('positions' in $$props) $$invalidate(4, positions = $$props.positions);
    		if ('sizeModifier' in $$props) sizeModifier = $$props.sizeModifier;
    		if ('stroke' in $$props) $$invalidate(5, stroke = $$props.stroke);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*shield, charge, chargeId*/ 521) {
    			{
    				$$invalidate(4, positions = shieldPositions[shield] || shieldPositions.spanish);
    				sizeModifier = shieldSize[shield] || 1;
    				$$invalidate(5, stroke = charge.stroke || "#000");
    				$$invalidate(3, chargeId = charge.charge);

    				// select shield shape if charge is just 'inescutcheon'
    				if (chargeId === "inescutcheon") $$invalidate(3, chargeId = "inescutcheon" + shield.charAt(0).toUpperCase() + shield.slice(1));
    			}
    		}
    	};

    	return [
    		charge,
    		i,
    		t,
    		chargeId,
    		positions,
    		stroke,
    		getElTransform,
    		addDrag,
    		coa,
    		shield,
    		type,
    		func
    	];
    }

    class Charge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {
    			coa: 8,
    			charge: 0,
    			i: 1,
    			shield: 9,
    			t: 2,
    			type: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Charge",
    			options,
    			id: create_fragment$t.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*coa*/ ctx[8] === undefined && !('coa' in props)) {
    			console.warn("<Charge> was created without expected prop 'coa'");
    		}

    		if (/*charge*/ ctx[0] === undefined && !('charge' in props)) {
    			console.warn("<Charge> was created without expected prop 'charge'");
    		}

    		if (/*i*/ ctx[1] === undefined && !('i' in props)) {
    			console.warn("<Charge> was created without expected prop 'i'");
    		}

    		if (/*shield*/ ctx[9] === undefined && !('shield' in props)) {
    			console.warn("<Charge> was created without expected prop 'shield'");
    		}

    		if (/*t*/ ctx[2] === undefined && !('t' in props)) {
    			console.warn("<Charge> was created without expected prop 't'");
    		}

    		if (/*type*/ ctx[10] === undefined && !('type' in props)) {
    			console.warn("<Charge> was created without expected prop 'type'");
    		}
    	}

    	get coa() {
    		throw new Error("<Charge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set coa(value) {
    		throw new Error("<Charge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charge() {
    		throw new Error("<Charge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charge(value) {
    		throw new Error("<Charge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get i() {
    		throw new Error("<Charge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set i(value) {
    		throw new Error("<Charge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shield() {
    		throw new Error("<Charge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shield(value) {
    		throw new Error("<Charge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t() {
    		throw new Error("<Charge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t(value) {
    		throw new Error("<Charge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Charge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Charge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\object\Shield.svelte generated by Svelte v3.44.2 */
    const file$s = "src\\components\\object\\Shield.svelte";

    function get_each_context$d(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    // (54:2) {#if division && division.division !== "no"}
    function create_if_block_19$1(ctx) {
    	let clipPath;
    	let raw_value = getTemplate(/*division*/ ctx[10].division, /*division*/ ctx[10].line) + "";

    	const block = {
    		c: function create() {
    			clipPath = svg_element("clipPath");
    			attr_dev(clipPath, "id", "division_" + /*id*/ ctx[9]);
    			add_location(clipPath, file$s, 54, 4, 2018);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, clipPath, anchor);
    			clipPath.innerHTML = raw_value;
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(clipPath);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19$1.name,
    		type: "if",
    		source: "(54:2) {#if division && division.division !== \\\"no\\\"}",
    		ctx
    	});

    	return block;
    }

    // (65:2) {#if division && division.division !== "no"}
    function create_if_block_4$2(ctx) {
    	let each0_anchor;
    	let if_block0_anchor;
    	let each1_anchor;
    	let g;
    	let rect;
    	let each3_anchor;
    	let if_block1_anchor;
    	let each4_anchor;
    	let current;
    	let each_value_8 = /*ordinariesRegular*/ ctx[12];
    	validate_each_argument(each_value_8);
    	let each_blocks_5 = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks_5[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	const out = i => transition_out(each_blocks_5[i], 1, 1, () => {
    		each_blocks_5[i] = null;
    	});

    	let if_block0 = /*diaperType*/ ctx[7] === "field" && create_if_block_16$1(ctx);
    	let each_value_7 = /*charges*/ ctx[11];
    	validate_each_argument(each_value_7);
    	let each_blocks_4 = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks_4[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	const out_1 = i => transition_out(each_blocks_4[i], 1, 1, () => {
    		each_blocks_4[i] = null;
    	});

    	let each_value_6 = /*ordinariesAboveCharges*/ ctx[13];
    	validate_each_argument(each_value_6);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks_3[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	const out_2 = i => transition_out(each_blocks_3[i], 1, 1, () => {
    		each_blocks_3[i] = null;
    	});

    	let each_value_5 = /*ordinariesRegular*/ ctx[12];
    	validate_each_argument(each_value_5);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks_2[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const out_3 = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let if_block1 = /*diaperType*/ ctx[7] === "division" && create_if_block_9$1(ctx);
    	let each_value_4 = /*charges*/ ctx[11];
    	validate_each_argument(each_value_4);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_1[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const out_4 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value_3 = /*ordinariesAboveCharges*/ ctx[13];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const out_5 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].c();
    			}

    			each0_anchor = empty();
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			each1_anchor = empty();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			g = svg_element("g");
    			rect = svg_element("rect");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			each3_anchor = empty();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			each4_anchor = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "200");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", /*clr*/ ctx[15](/*division*/ ctx[10].t));
    			add_location(rect, file$s, 96, 6, 3687);
    			attr_dev(g, "class", "division");
    			attr_dev(g, "clip-path", "url(#division_" + /*id*/ ctx[9] + ")");
    			add_location(g, file$s, 95, 4, 3627);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].m(target, anchor);
    			}

    			insert_dev(target, each0_anchor, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, if_block0_anchor, anchor);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].m(target, anchor);
    			}

    			insert_dev(target, each1_anchor, anchor);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(target, anchor);
    			}

    			insert_dev(target, g, anchor);
    			append_dev(g, rect);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(g, null);
    			}

    			append_dev(g, each3_anchor);
    			if (if_block1) if_block1.m(g, null);
    			append_dev(g, if_block1_anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g, null);
    			}

    			append_dev(g, each4_anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*coa, ordinariesRegular, shieldPath, clr, type, counterChange, division*/ 54313) {
    				each_value_8 = /*ordinariesRegular*/ ctx[12];
    				validate_each_argument(each_value_8);
    				let i;

    				for (i = 0; i < each_value_8.length; i += 1) {
    					const child_ctx = get_each_context_8(ctx, each_value_8, i);

    					if (each_blocks_5[i]) {
    						each_blocks_5[i].p(child_ctx, dirty);
    						transition_in(each_blocks_5[i], 1);
    					} else {
    						each_blocks_5[i] = create_each_block_8(child_ctx);
    						each_blocks_5[i].c();
    						transition_in(each_blocks_5[i], 1);
    						each_blocks_5[i].m(each0_anchor.parentNode, each0_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_8.length; i < each_blocks_5.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*diaperType*/ ctx[7] === "field") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_16$1(ctx);
    					if_block0.c();
    					if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*coa, charges, $shield, clr, type, counterChange, division*/ 52249) {
    				each_value_7 = /*charges*/ ctx[11];
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks_4[i]) {
    						each_blocks_4[i].p(child_ctx, dirty);
    						transition_in(each_blocks_4[i], 1);
    					} else {
    						each_blocks_4[i] = create_each_block_7(child_ctx);
    						each_blocks_4[i].c();
    						transition_in(each_blocks_4[i], 1);
    						each_blocks_4[i].m(each1_anchor.parentNode, each1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_7.length; i < each_blocks_4.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*coa, ordinariesAboveCharges, shieldPath, clr, type, counterChange, division*/ 58409) {
    				each_value_6 = /*ordinariesAboveCharges*/ ctx[13];
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    						transition_in(each_blocks_3[i], 1);
    					} else {
    						each_blocks_3[i] = create_each_block_6(child_ctx);
    						each_blocks_3[i].c();
    						transition_in(each_blocks_3[i], 1);
    						each_blocks_3[i].m(g.parentNode, g);
    					}
    				}

    				group_outros();

    				for (i = each_value_6.length; i < each_blocks_3.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*coa, ordinariesRegular, shieldPath, clr, type, counterChange*/ 53289) {
    				each_value_5 = /*ordinariesRegular*/ ctx[12];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_5(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(g, each3_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_5.length; i < each_blocks_2.length; i += 1) {
    					out_3(i);
    				}

    				check_outros();
    			}

    			if (/*diaperType*/ ctx[7] === "division") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_9$1(ctx);
    					if_block1.c();
    					if_block1.m(g, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*coa, charges, $shield, clr, type, counterChange*/ 51225) {
    				each_value_4 = /*charges*/ ctx[11];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_4(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(g, each4_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_4.length; i < each_blocks_1.length; i += 1) {
    					out_4(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*coa, ordinariesAboveCharges, shieldPath, clr, type, counterChange*/ 57385) {
    				each_value_3 = /*ordinariesAboveCharges*/ ctx[13];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(g, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_3.length; i < each_blocks.length; i += 1) {
    					out_5(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_8.length; i += 1) {
    				transition_in(each_blocks_5[i]);
    			}

    			for (let i = 0; i < each_value_7.length; i += 1) {
    				transition_in(each_blocks_4[i]);
    			}

    			for (let i = 0; i < each_value_6.length; i += 1) {
    				transition_in(each_blocks_3[i]);
    			}

    			for (let i = 0; i < each_value_5.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_4.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value_3.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_5 = each_blocks_5.filter(Boolean);

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				transition_out(each_blocks_5[i]);
    			}

    			each_blocks_4 = each_blocks_4.filter(Boolean);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				transition_out(each_blocks_4[i]);
    			}

    			each_blocks_3 = each_blocks_3.filter(Boolean);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				transition_out(each_blocks_3[i]);
    			}

    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks_5, detaching);
    			if (detaching) detach_dev(each0_anchor);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(if_block0_anchor);
    			destroy_each(each_blocks_4, detaching);
    			if (detaching) detach_dev(each1_anchor);
    			destroy_each(each_blocks_3, detaching);
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks_2, detaching);
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(65:2) {#if division && division.division !== \\\"no\\\"}",
    		ctx
    	});

    	return block;
    }

    // (70:47) 
    function create_if_block_18$1(ctx) {
    	let ordinary;
    	let current;

    	ordinary = new Ordinary({
    			props: {
    				coa: /*coa*/ ctx[0],
    				ordinary: /*ordinary*/ ctx[21],
    				i: /*i*/ ctx[23],
    				shieldPath: /*shieldPath*/ ctx[5],
    				t: /*counterChange*/ ctx[14](/*division*/ ctx[10].t, /*ordinary*/ ctx[21].ordinary),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_changes = {};
    			if (dirty[0] & /*coa*/ 1) ordinary_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*shieldPath*/ 32) ordinary_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty[0] & /*type*/ 8) ordinary_changes.type = /*type*/ ctx[3];
    			ordinary.$set(ordinary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18$1.name,
    		type: "if",
    		source: "(70:47) ",
    		ctx
    	});

    	return block;
    }

    // (68:6) {#if ordinary.divided === "field"}
    function create_if_block_17$1(ctx) {
    	let ordinary;
    	let current;

    	ordinary = new Ordinary({
    			props: {
    				coa: /*coa*/ ctx[0],
    				ordinary: /*ordinary*/ ctx[21],
    				i: /*i*/ ctx[23],
    				shieldPath: /*shieldPath*/ ctx[5],
    				t: /*clr*/ ctx[15](/*ordinary*/ ctx[21].t),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_changes = {};
    			if (dirty[0] & /*coa*/ 1) ordinary_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*shieldPath*/ 32) ordinary_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty[0] & /*type*/ 8) ordinary_changes.type = /*type*/ ctx[3];
    			ordinary.$set(ordinary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17$1.name,
    		type: "if",
    		source: "(68:6) {#if ordinary.divided === \\\"field\\\"}",
    		ctx
    	});

    	return block;
    }

    // (67:4) {#each ordinariesRegular as ordinary, i}
    function create_each_block_8(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_17$1, create_if_block_18$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*ordinary*/ ctx[21].divided === "field") return 0;
    		if (/*ordinary*/ ctx[21].divided === "counter") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(ctx, dirty);
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
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(67:4) {#each ordinariesRegular as ordinary, i}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {#if diaperType === "field"}
    function create_if_block_16$1(ctx) {
    	let rect;
    	let rect_fill_value;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "class", "diaper");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "200");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", rect_fill_value = "url(#" + /*coaDiaper*/ ctx[6] + ")");
    			set_style(rect, "pointer-events", "none");
    			add_location(rect, file$s, 75, 6, 2760);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*coaDiaper*/ 64 && rect_fill_value !== (rect_fill_value = "url(#" + /*coaDiaper*/ ctx[6] + ")")) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16$1.name,
    		type: "if",
    		source: "(75:4) {#if diaperType === \\\"field\\\"}",
    		ctx
    	});

    	return block;
    }

    // (82:45) 
    function create_if_block_15$1(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[24],
    				i: /*i*/ ctx[23],
    				shield: /*$shield*/ ctx[4],
    				t: /*counterChange*/ ctx[14](/*division*/ ctx[10].t, /*charge*/ ctx[24].charge),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(charge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(charge, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const charge_changes = {};
    			if (dirty[0] & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*$shield*/ 16) charge_changes.shield = /*$shield*/ ctx[4];
    			if (dirty[0] & /*type*/ 8) charge_changes.type = /*type*/ ctx[3];
    			charge.$set(charge_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(charge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(charge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(charge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15$1.name,
    		type: "if",
    		source: "(82:45) ",
    		ctx
    	});

    	return block;
    }

    // (80:6) {#if charge.divided === "field"}
    function create_if_block_14$1(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[24],
    				i: /*i*/ ctx[23],
    				shield: /*$shield*/ ctx[4],
    				t: /*clr*/ ctx[15](/*charge*/ ctx[24].t),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(charge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(charge, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const charge_changes = {};
    			if (dirty[0] & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*$shield*/ 16) charge_changes.shield = /*$shield*/ ctx[4];
    			if (dirty[0] & /*type*/ 8) charge_changes.type = /*type*/ ctx[3];
    			charge.$set(charge_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(charge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(charge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(charge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14$1.name,
    		type: "if",
    		source: "(80:6) {#if charge.divided === \\\"field\\\"}",
    		ctx
    	});

    	return block;
    }

    // (79:4) {#each charges as charge, i}
    function create_each_block_7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_14$1, create_if_block_15$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*charge*/ ctx[24].divided === "field") return 0;
    		if (/*charge*/ ctx[24].divided === "counter") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(ctx, dirty);
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
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(79:4) {#each charges as charge, i}",
    		ctx
    	});

    	return block;
    }

    // (90:47) 
    function create_if_block_13$1(ctx) {
    	let ordinary;
    	let current;

    	ordinary = new Ordinary({
    			props: {
    				coa: /*coa*/ ctx[0],
    				ordinary: /*ordinary*/ ctx[21],
    				i: /*i*/ ctx[23],
    				shieldPath: /*shieldPath*/ ctx[5],
    				t: /*counterChange*/ ctx[14](/*division*/ ctx[10].t, /*ordinary*/ ctx[21].ordinary),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_changes = {};
    			if (dirty[0] & /*coa*/ 1) ordinary_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*shieldPath*/ 32) ordinary_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty[0] & /*type*/ 8) ordinary_changes.type = /*type*/ ctx[3];
    			ordinary.$set(ordinary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13$1.name,
    		type: "if",
    		source: "(90:47) ",
    		ctx
    	});

    	return block;
    }

    // (88:6) {#if ordinary.divided === "field"}
    function create_if_block_12$1(ctx) {
    	let ordinary;
    	let current;

    	ordinary = new Ordinary({
    			props: {
    				coa: /*coa*/ ctx[0],
    				ordinary: /*ordinary*/ ctx[21],
    				i: /*i*/ ctx[23],
    				shieldPath: /*shieldPath*/ ctx[5],
    				t: /*clr*/ ctx[15](/*ordinary*/ ctx[21].t),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_changes = {};
    			if (dirty[0] & /*coa*/ 1) ordinary_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*shieldPath*/ 32) ordinary_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty[0] & /*type*/ 8) ordinary_changes.type = /*type*/ ctx[3];
    			ordinary.$set(ordinary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$1.name,
    		type: "if",
    		source: "(88:6) {#if ordinary.divided === \\\"field\\\"}",
    		ctx
    	});

    	return block;
    }

    // (87:4) {#each ordinariesAboveCharges as ordinary, i}
    function create_each_block_6(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_12$1, create_if_block_13$1];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*ordinary*/ ctx[21].divided === "field") return 0;
    		if (/*ordinary*/ ctx[21].divided === "counter") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_2(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(ctx, dirty);
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
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(87:4) {#each ordinariesAboveCharges as ordinary, i}",
    		ctx
    	});

    	return block;
    }

    // (102:49) 
    function create_if_block_11$1(ctx) {
    	let ordinary;
    	let current;

    	ordinary = new Ordinary({
    			props: {
    				coa: /*coa*/ ctx[0],
    				ordinary: /*ordinary*/ ctx[21],
    				i: /*i*/ ctx[23],
    				shieldPath: /*shieldPath*/ ctx[5],
    				t: /*counterChange*/ ctx[14](/*coa*/ ctx[0].t1, /*ordinary*/ ctx[21].ordinary),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_changes = {};
    			if (dirty[0] & /*coa*/ 1) ordinary_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*shieldPath*/ 32) ordinary_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty[0] & /*coa*/ 1) ordinary_changes.t = /*counterChange*/ ctx[14](/*coa*/ ctx[0].t1, /*ordinary*/ ctx[21].ordinary);
    			if (dirty[0] & /*type*/ 8) ordinary_changes.type = /*type*/ ctx[3];
    			ordinary.$set(ordinary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$1.name,
    		type: "if",
    		source: "(102:49) ",
    		ctx
    	});

    	return block;
    }

    // (100:8) {#if ordinary.divided === "division"}
    function create_if_block_10$1(ctx) {
    	let ordinary;
    	let current;

    	ordinary = new Ordinary({
    			props: {
    				coa: /*coa*/ ctx[0],
    				ordinary: /*ordinary*/ ctx[21],
    				i: /*i*/ ctx[23],
    				shieldPath: /*shieldPath*/ ctx[5],
    				t: /*clr*/ ctx[15](/*ordinary*/ ctx[21].t),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_changes = {};
    			if (dirty[0] & /*coa*/ 1) ordinary_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*shieldPath*/ 32) ordinary_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty[0] & /*type*/ 8) ordinary_changes.type = /*type*/ ctx[3];
    			ordinary.$set(ordinary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$1.name,
    		type: "if",
    		source: "(100:8) {#if ordinary.divided === \\\"division\\\"}",
    		ctx
    	});

    	return block;
    }

    // (99:6) {#each ordinariesRegular as ordinary, i}
    function create_each_block_5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_10$1, create_if_block_11$1];
    	const if_blocks = [];

    	function select_block_type_3(ctx, dirty) {
    		if (/*ordinary*/ ctx[21].divided === "division") return 0;
    		if (/*ordinary*/ ctx[21].divided === "counter") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_3(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(ctx, dirty);
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
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(99:6) {#each ordinariesRegular as ordinary, i}",
    		ctx
    	});

    	return block;
    }

    // (107:6) {#if diaperType === "division"}
    function create_if_block_9$1(ctx) {
    	let rect;
    	let rect_fill_value;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "class", "diaper");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "200");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", rect_fill_value = "url(#" + /*coaDiaper*/ ctx[6] + ")");
    			set_style(rect, "pointer-events", "none");
    			add_location(rect, file$s, 107, 8, 4179);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*coaDiaper*/ 64 && rect_fill_value !== (rect_fill_value = "url(#" + /*coaDiaper*/ ctx[6] + ")")) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(107:6) {#if diaperType === \\\"division\\\"}",
    		ctx
    	});

    	return block;
    }

    // (114:47) 
    function create_if_block_8$1(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[24],
    				i: /*i*/ ctx[23],
    				shield: /*$shield*/ ctx[4],
    				t: /*counterChange*/ ctx[14](/*coa*/ ctx[0].t1, /*charge*/ ctx[24].charge),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(charge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(charge, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const charge_changes = {};
    			if (dirty[0] & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*$shield*/ 16) charge_changes.shield = /*$shield*/ ctx[4];
    			if (dirty[0] & /*coa*/ 1) charge_changes.t = /*counterChange*/ ctx[14](/*coa*/ ctx[0].t1, /*charge*/ ctx[24].charge);
    			if (dirty[0] & /*type*/ 8) charge_changes.type = /*type*/ ctx[3];
    			charge.$set(charge_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(charge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(charge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(charge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(114:47) ",
    		ctx
    	});

    	return block;
    }

    // (112:8) {#if charge.divided === "division"}
    function create_if_block_7$2(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[24],
    				i: /*i*/ ctx[23],
    				shield: /*$shield*/ ctx[4],
    				t: /*clr*/ ctx[15](/*charge*/ ctx[24].t),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(charge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(charge, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const charge_changes = {};
    			if (dirty[0] & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*$shield*/ 16) charge_changes.shield = /*$shield*/ ctx[4];
    			if (dirty[0] & /*type*/ 8) charge_changes.type = /*type*/ ctx[3];
    			charge.$set(charge_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(charge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(charge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(charge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(112:8) {#if charge.divided === \\\"division\\\"}",
    		ctx
    	});

    	return block;
    }

    // (111:6) {#each charges as charge, i}
    function create_each_block_4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_7$2, create_if_block_8$1];
    	const if_blocks = [];

    	function select_block_type_4(ctx, dirty) {
    		if (/*charge*/ ctx[24].divided === "division") return 0;
    		if (/*charge*/ ctx[24].divided === "counter") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_4(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(ctx, dirty);
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
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(111:6) {#each charges as charge, i}",
    		ctx
    	});

    	return block;
    }

    // (122:49) 
    function create_if_block_6$2(ctx) {
    	let ordinary;
    	let current;

    	ordinary = new Ordinary({
    			props: {
    				coa: /*coa*/ ctx[0],
    				ordinary: /*ordinary*/ ctx[21],
    				i: /*i*/ ctx[23],
    				shieldPath: /*shieldPath*/ ctx[5],
    				t: /*counterChange*/ ctx[14](/*coa*/ ctx[0].t1, /*ordinary*/ ctx[21].ordinary),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_changes = {};
    			if (dirty[0] & /*coa*/ 1) ordinary_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*shieldPath*/ 32) ordinary_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty[0] & /*coa*/ 1) ordinary_changes.t = /*counterChange*/ ctx[14](/*coa*/ ctx[0].t1, /*ordinary*/ ctx[21].ordinary);
    			if (dirty[0] & /*type*/ 8) ordinary_changes.type = /*type*/ ctx[3];
    			ordinary.$set(ordinary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(122:49) ",
    		ctx
    	});

    	return block;
    }

    // (120:8) {#if ordinary.divided === "division"}
    function create_if_block_5$2(ctx) {
    	let ordinary;
    	let current;

    	ordinary = new Ordinary({
    			props: {
    				coa: /*coa*/ ctx[0],
    				ordinary: /*ordinary*/ ctx[21],
    				i: /*i*/ ctx[23],
    				shieldPath: /*shieldPath*/ ctx[5],
    				t: /*clr*/ ctx[15](/*ordinary*/ ctx[21].t),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_changes = {};
    			if (dirty[0] & /*coa*/ 1) ordinary_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*shieldPath*/ 32) ordinary_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty[0] & /*type*/ 8) ordinary_changes.type = /*type*/ ctx[3];
    			ordinary.$set(ordinary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(120:8) {#if ordinary.divided === \\\"division\\\"}",
    		ctx
    	});

    	return block;
    }

    // (119:6) {#each ordinariesAboveCharges as ordinary, i}
    function create_each_block_3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_5$2, create_if_block_6$2];
    	const if_blocks = [];

    	function select_block_type_5(ctx, dirty) {
    		if (/*ordinary*/ ctx[21].divided === "division") return 0;
    		if (/*ordinary*/ ctx[21].divided === "counter") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_5(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(ctx, dirty);
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
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(119:6) {#each ordinariesAboveCharges as ordinary, i}",
    		ctx
    	});

    	return block;
    }

    // (131:4) {#if !ordinary.divided}
    function create_if_block_3$2(ctx) {
    	let ordinary;
    	let current;

    	ordinary = new Ordinary({
    			props: {
    				coa: /*coa*/ ctx[0],
    				ordinary: /*ordinary*/ ctx[21],
    				i: /*i*/ ctx[23],
    				shieldPath: /*shieldPath*/ ctx[5],
    				t: /*clr*/ ctx[15](/*ordinary*/ ctx[21].t),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_changes = {};
    			if (dirty[0] & /*coa*/ 1) ordinary_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*shieldPath*/ 32) ordinary_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty[0] & /*type*/ 8) ordinary_changes.type = /*type*/ ctx[3];
    			ordinary.$set(ordinary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(131:4) {#if !ordinary.divided}",
    		ctx
    	});

    	return block;
    }

    // (130:2) {#each ordinariesRegular as ordinary, i}
    function create_each_block_2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !/*ordinary*/ ctx[21].divided && create_if_block_3$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!/*ordinary*/ ctx[21].divided) if_block.p(ctx, dirty);
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
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(130:2) {#each ordinariesRegular as ordinary, i}",
    		ctx
    	});

    	return block;
    }

    // (136:2) {#if diaperType === "overall"}
    function create_if_block_2$4(ctx) {
    	let rect;
    	let rect_fill_value;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "class", "diaper");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "200");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", rect_fill_value = "url(#" + /*coaDiaper*/ ctx[6] + ")");
    			set_style(rect, "pointer-events", "none");
    			add_location(rect, file$s, 136, 4, 5294);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*coaDiaper*/ 64 && rect_fill_value !== (rect_fill_value = "url(#" + /*coaDiaper*/ ctx[6] + ")")) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(136:2) {#if diaperType === \\\"overall\\\"}",
    		ctx
    	});

    	return block;
    }

    // (141:4) {#if !charge.divided || !division}
    function create_if_block_1$5(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[24],
    				i: /*i*/ ctx[23],
    				shield: /*$shield*/ ctx[4],
    				t: /*clr*/ ctx[15](/*charge*/ ctx[24].t),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(charge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(charge, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const charge_changes = {};
    			if (dirty[0] & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*$shield*/ 16) charge_changes.shield = /*$shield*/ ctx[4];
    			if (dirty[0] & /*type*/ 8) charge_changes.type = /*type*/ ctx[3];
    			charge.$set(charge_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(charge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(charge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(charge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(141:4) {#if !charge.divided || !division}",
    		ctx
    	});

    	return block;
    }

    // (140:2) {#each charges as charge, i}
    function create_each_block_1$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (!/*charge*/ ctx[24].divided || !/*division*/ ctx[10]) && create_if_block_1$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!/*charge*/ ctx[24].divided || !/*division*/ ctx[10]) if_block.p(ctx, dirty);
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
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(140:2) {#each charges as charge, i}",
    		ctx
    	});

    	return block;
    }

    // (147:4) {#if !ordinary.divided}
    function create_if_block$c(ctx) {
    	let ordinary;
    	let current;

    	ordinary = new Ordinary({
    			props: {
    				coa: /*coa*/ ctx[0],
    				ordinary: /*ordinary*/ ctx[21],
    				i: /*i*/ ctx[23],
    				shieldPath: /*shieldPath*/ ctx[5],
    				t: /*clr*/ ctx[15](/*ordinary*/ ctx[21].t),
    				type: /*type*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_changes = {};
    			if (dirty[0] & /*coa*/ 1) ordinary_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*shieldPath*/ 32) ordinary_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty[0] & /*type*/ 8) ordinary_changes.type = /*type*/ ctx[3];
    			ordinary.$set(ordinary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(147:4) {#if !ordinary.divided}",
    		ctx
    	});

    	return block;
    }

    // (146:2) {#each ordinariesAboveCharges as ordinary, i}
    function create_each_block$d(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !/*ordinary*/ ctx[21].divided && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!/*ordinary*/ ctx[21].divided) if_block.p(ctx, dirty);
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
    		id: create_each_block$d.name,
    		type: "each",
    		source: "(146:2) {#each ordinariesAboveCharges as ordinary, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let defs;
    	let clipPath;
    	let path0;
    	let t0;
    	let g;
    	let rect;
    	let rect_fill_value;
    	let if_block1_anchor;
    	let each0_anchor;
    	let if_block2_anchor;
    	let each1_anchor;
    	let t1;
    	let path1;
    	let current;
    	let if_block0 = /*division*/ ctx[10] && /*division*/ ctx[10].division !== "no" && create_if_block_19$1(ctx);
    	let if_block1 = /*division*/ ctx[10] && /*division*/ ctx[10].division !== "no" && create_if_block_4$2(ctx);
    	let each_value_2 = /*ordinariesRegular*/ ctx[12];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let if_block2 = /*diaperType*/ ctx[7] === "overall" && create_if_block_2$4(ctx);
    	let each_value_1 = /*charges*/ ctx[11];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*ordinariesAboveCharges*/ ctx[13];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$d(get_each_context$d(ctx, each_value, i));
    	}

    	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			defs = svg_element("defs");
    			clipPath = svg_element("clipPath");
    			path0 = svg_element("path");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			g = svg_element("g");
    			rect = svg_element("rect");
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			each0_anchor = empty();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			each1_anchor = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			path1 = svg_element("path");
    			attr_dev(path0, "d", /*shieldPath*/ ctx[5]);
    			add_location(path0, file$s, 51, 4, 1926);
    			attr_dev(clipPath, "id", "shield_" + /*id*/ ctx[9]);
    			add_location(clipPath, file$s, 50, 2, 1893);
    			add_location(defs, file$s, 49, 0, 1883);
    			attr_dev(rect, "class", "field");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "200");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", rect_fill_value = /*clr*/ ctx[15](/*coa*/ ctx[0].t1));
    			add_location(rect, file$s, 62, 2, 2202);
    			attr_dev(g, "clip-path", "url(#shield_" + /*id*/ ctx[9] + ")");
    			add_location(g, file$s, 60, 0, 2147);
    			attr_dev(path1, "class", "grad");
    			attr_dev(path1, "d", /*shieldPath*/ ctx[5]);
    			attr_dev(path1, "fill", /*overFill*/ ctx[8]);
    			attr_dev(path1, "stroke", /*border*/ ctx[1]);
    			attr_dev(path1, "stroke-width", /*borderWidth*/ ctx[2]);
    			set_style(path1, "pointer-events", "none");
    			add_location(path1, file$s, 152, 0, 5785);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, defs, anchor);
    			append_dev(defs, clipPath);
    			append_dev(clipPath, path0);
    			if (if_block0) if_block0.m(defs, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, g, anchor);
    			append_dev(g, rect);
    			if (if_block1) if_block1.m(g, null);
    			append_dev(g, if_block1_anchor);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(g, null);
    			}

    			append_dev(g, each0_anchor);
    			if (if_block2) if_block2.m(g, null);
    			append_dev(g, if_block2_anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g, null);
    			}

    			append_dev(g, each1_anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, path1, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*shieldPath*/ 32) {
    				attr_dev(path0, "d", /*shieldPath*/ ctx[5]);
    			}

    			if (/*division*/ ctx[10] && /*division*/ ctx[10].division !== "no") if_block0.p(ctx, dirty);

    			if (!current || dirty[0] & /*coa*/ 1 && rect_fill_value !== (rect_fill_value = /*clr*/ ctx[15](/*coa*/ ctx[0].t1))) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (/*division*/ ctx[10] && /*division*/ ctx[10].division !== "no") if_block1.p(ctx, dirty);

    			if (dirty[0] & /*coa, ordinariesRegular, shieldPath, clr, type*/ 36905) {
    				each_value_2 = /*ordinariesRegular*/ ctx[12];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(g, each0_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*diaperType*/ ctx[7] === "overall") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$4(ctx);
    					if_block2.c();
    					if_block2.m(g, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*coa, charges, $shield, clr, type, division*/ 35865) {
    				each_value_1 = /*charges*/ ctx[11];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$3(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(g, each1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*coa, ordinariesAboveCharges, shieldPath, clr, type*/ 41001) {
    				each_value = /*ordinariesAboveCharges*/ ctx[13];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$d(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$d(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(g, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*shieldPath*/ 32) {
    				attr_dev(path1, "d", /*shieldPath*/ ctx[5]);
    			}

    			if (!current || dirty[0] & /*overFill*/ 256) {
    				attr_dev(path1, "fill", /*overFill*/ ctx[8]);
    			}

    			if (!current || dirty[0] & /*border*/ 2) {
    				attr_dev(path1, "stroke", /*border*/ ctx[1]);
    			}

    			if (!current || dirty[0] & /*borderWidth*/ 4) {
    				attr_dev(path1, "stroke-width", /*borderWidth*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(defs);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(g);
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks_2, detaching);
    			if (if_block2) if_block2.d();
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(path1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let $colors;
    	let $grad;
    	let $diaper;
    	let $shield;
    	validate_store(colors, 'colors');
    	component_subscribe($$self, colors, $$value => $$invalidate(18, $colors = $$value));
    	validate_store(grad, 'grad');
    	component_subscribe($$self, grad, $$value => $$invalidate(16, $grad = $$value));
    	validate_store(diaper, 'diaper');
    	component_subscribe($$self, diaper, $$value => $$invalidate(17, $diaper = $$value));
    	validate_store(shield, 'shield');
    	component_subscribe($$self, shield, $$value => $$invalidate(4, $shield = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Shield', slots, []);
    	let { coa, border, borderWidth, type } = $$props;
    	const id = coa.seed || Math.floor(Math.random() * 1e9);
    	const { division, ordinaries: ordinaries$1 = [], charges: charges$1 = [] } = coa;
    	const ordinariesRegular = ordinaries$1.filter(o => !o.above);
    	const ordinariesAboveCharges = ordinaries$1.filter(o => o.above);
    	charges$1.forEach(charge => addCharge(charge.charge));
    	let shieldPath, coaDiaper, diaperType, overFill;

    	function getDieperType() {
    		if (!coaDiaper || coaDiaper === "no") return null;
    		const f = !coa.t1.includes("-");
    		const d = !division?.t.includes("-");
    		if (f && d) return "overall";
    		if (f) return "field";
    		if (d) return "division";
    		return null;
    	}

    	// if charge doesn't support pattern, return basic tincture
    	function counterChange(t, charge) {
    		if (!(/-/).test(t)) return clr(t); // not a pattern
    		if (charges.patternable.includes(charge)) return clr(t); // patternable
    		if (ordinaries.patternable.includes(charge)) return clr(t); // patternable
    		return clr(t.split("-")[1]); // not patternable, return basic color
    	}

    	// get color or link to pattern
    	function clr(tincture) {
    		if ($colors[tincture]) return $colors[tincture];
    		addPattern(tincture);
    		return "url(#" + tincture + ")";
    	}

    	const writable_props = ['coa', 'border', 'borderWidth', 'type'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Shield> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('coa' in $$props) $$invalidate(0, coa = $$props.coa);
    		if ('border' in $$props) $$invalidate(1, border = $$props.border);
    		if ('borderWidth' in $$props) $$invalidate(2, borderWidth = $$props.borderWidth);
    		if ('type' in $$props) $$invalidate(3, type = $$props.type);
    	};

    	$$self.$capture_state = () => ({
    		Ordinary,
    		Charge,
    		chargesData: charges,
    		ordinariesData: ordinaries,
    		shield,
    		colors,
    		grad,
    		diaper,
    		shieldPaths,
    		getTemplate,
    		addPattern,
    		addCharge,
    		coa,
    		border,
    		borderWidth,
    		type,
    		id,
    		division,
    		ordinaries: ordinaries$1,
    		charges: charges$1,
    		ordinariesRegular,
    		ordinariesAboveCharges,
    		shieldPath,
    		coaDiaper,
    		diaperType,
    		overFill,
    		getDieperType,
    		counterChange,
    		clr,
    		$colors,
    		$grad,
    		$diaper,
    		$shield
    	});

    	$$self.$inject_state = $$props => {
    		if ('coa' in $$props) $$invalidate(0, coa = $$props.coa);
    		if ('border' in $$props) $$invalidate(1, border = $$props.border);
    		if ('borderWidth' in $$props) $$invalidate(2, borderWidth = $$props.borderWidth);
    		if ('type' in $$props) $$invalidate(3, type = $$props.type);
    		if ('shieldPath' in $$props) $$invalidate(5, shieldPath = $$props.shieldPath);
    		if ('coaDiaper' in $$props) $$invalidate(6, coaDiaper = $$props.coaDiaper);
    		if ('diaperType' in $$props) $$invalidate(7, diaperType = $$props.diaperType);
    		if ('overFill' in $$props) $$invalidate(8, overFill = $$props.overFill);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$shield, type, coa, $diaper, $grad*/ 196633) {
    			{
    				$$invalidate(5, shieldPath = shieldPaths[$shield]);
    				$$invalidate(6, coaDiaper = type === "menuItem" ? null : coa.diaper || $diaper);
    				$$invalidate(7, diaperType = getDieperType());
    				$$invalidate(8, overFill = !$grad || $grad === "no" ? "none" : `url(#${$grad})`);
    			}
    		}
    	};

    	return [
    		coa,
    		border,
    		borderWidth,
    		type,
    		$shield,
    		shieldPath,
    		coaDiaper,
    		diaperType,
    		overFill,
    		id,
    		division,
    		charges$1,
    		ordinariesRegular,
    		ordinariesAboveCharges,
    		counterChange,
    		clr,
    		$grad,
    		$diaper
    	];
    }

    class Shield extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$s,
    			create_fragment$s,
    			safe_not_equal,
    			{
    				coa: 0,
    				border: 1,
    				borderWidth: 2,
    				type: 3
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shield",
    			options,
    			id: create_fragment$s.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*coa*/ ctx[0] === undefined && !('coa' in props)) {
    			console.warn("<Shield> was created without expected prop 'coa'");
    		}

    		if (/*border*/ ctx[1] === undefined && !('border' in props)) {
    			console.warn("<Shield> was created without expected prop 'border'");
    		}

    		if (/*borderWidth*/ ctx[2] === undefined && !('borderWidth' in props)) {
    			console.warn("<Shield> was created without expected prop 'borderWidth'");
    		}

    		if (/*type*/ ctx[3] === undefined && !('type' in props)) {
    			console.warn("<Shield> was created without expected prop 'type'");
    		}
    	}

    	get coa() {
    		throw new Error("<Shield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set coa(value) {
    		throw new Error("<Shield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get border() {
    		throw new Error("<Shield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set border(value) {
    		throw new Error("<Shield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderWidth() {
    		throw new Error("<Shield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderWidth(value) {
    		throw new Error("<Shield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Shield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Shield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\Grid.svelte generated by Svelte v3.44.2 */
    const file$r = "src\\components\\editor\\Grid.svelte";

    // (8:0) {#if $showGrid}
    function create_if_block$b(ctx) {
    	let pattern;
    	let path;
    	let t;
    	let g;
    	let rect;
    	let g_transition;
    	let current;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			path = svg_element("path");
    			t = space();
    			g = svg_element("g");
    			rect = svg_element("rect");
    			attr_dev(path, "d", "M 100 0 L 0 0 0 100");
    			attr_dev(path, "fill", "none");
    			attr_dev(path, "stroke", "#000");
    			attr_dev(path, "opacity", ".2");
    			attr_dev(path, "stroke-width", ".5");
    			add_location(path, file$r, 9, 4, 276);
    			attr_dev(pattern, "id", "gridPattern");
    			attr_dev(pattern, "width", /*$grid*/ ctx[2]);
    			attr_dev(pattern, "height", /*$grid*/ ctx[2]);
    			attr_dev(pattern, "patternUnits", "userSpaceOnUse");
    			add_location(pattern, file$r, 8, 2, 185);
    			attr_dev(rect, "x", "-200");
    			attr_dev(rect, "y", "-200");
    			attr_dev(rect, "width", "400");
    			attr_dev(rect, "height", "400");
    			attr_dev(rect, "fill", "url(#gridPattern)");
    			add_location(rect, file$r, 12, 4, 491);
    			attr_dev(g, "id", "grid");
    			set_style(g, "pointer-events", "none");
    			attr_dev(g, "transform", /*transform*/ ctx[0]);
    			attr_dev(g, "transform-origin", "center");
    			add_location(g, file$r, 11, 2, 383);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, path);
    			insert_dev(target, t, anchor);
    			insert_dev(target, g, anchor);
    			append_dev(g, rect);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*$grid*/ 4) {
    				attr_dev(pattern, "width", /*$grid*/ ctx[2]);
    			}

    			if (!current || dirty & /*$grid*/ 4) {
    				attr_dev(pattern, "height", /*$grid*/ ctx[2]);
    			}

    			if (!current || dirty & /*transform*/ 1) {
    				attr_dev(g, "transform", /*transform*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!g_transition) g_transition = create_bidirectional_transition(g, fade, {}, true);
    					g_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (local) {
    				if (!g_transition) g_transition = create_bidirectional_transition(g, fade, {}, false);
    				g_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(g);
    			if (detaching && g_transition) g_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(8:0) {#if $showGrid}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let if_block_anchor;
    	let if_block = /*$showGrid*/ ctx[1] && create_if_block$b(ctx);

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
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$showGrid*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$showGrid*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$b(ctx);
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
    			transition_in(if_block);
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let transform;
    	let $state;
    	let $showGrid;
    	let $grid;
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(3, $state = $$value));
    	validate_store(showGrid, 'showGrid');
    	component_subscribe($$self, showGrid, $$value => $$invalidate(1, $showGrid = $$value));
    	validate_store(grid, 'grid');
    	component_subscribe($$self, grid, $$value => $$invalidate(2, $grid = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Grid', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Grid> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		state,
    		grid,
    		showGrid,
    		fade,
    		transform,
    		$state,
    		$showGrid,
    		$grid
    	});

    	$$self.$inject_state = $$props => {
    		if ('transform' in $$props) $$invalidate(0, transform = $$props.transform);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$state*/ 8) {
    			$$invalidate(0, transform = $state.transform || null);
    		}
    	};

    	return [transform, $showGrid, $grid, $state];
    }

    class Grid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grid",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src\components\editor\Positions.svelte generated by Svelte v3.44.2 */

    const { Object: Object_1$a } = globals;
    const file$q = "src\\components\\editor\\Positions.svelte";

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (17:0) {#if $state.positions}
    function create_if_block$a(ctx) {
    	let g1;
    	let g0;
    	let g0_transition;
    	let g1_transform_value;
    	let current;
    	let each_value = /*points*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$c(get_each_context$c(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g1 = svg_element("g");
    			g0 = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g0, "id", "positions");
    			attr_dev(g0, "transform", "translate(100, 100)");
    			add_location(g0, file$q, 18, 4, 608);
    			attr_dev(g1, "transform", g1_transform_value = /*$state*/ ctx[1].transform || null);
    			attr_dev(g1, "transform-origin", "center");
    			add_location(g1, file$q, 17, 2, 536);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g1, anchor);
    			append_dev(g1, g0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*points, getClass, $state*/ 3) {
    				each_value = /*points*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$c(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$c(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*$state*/ 2 && g1_transform_value !== (g1_transform_value = /*$state*/ ctx[1].transform || null)) {
    				attr_dev(g1, "transform", g1_transform_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!g0_transition) g0_transition = create_bidirectional_transition(g0, fade, {}, true);
    					g0_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (local) {
    				if (!g0_transition) g0_transition = create_bidirectional_transition(g0, fade, {}, false);
    				g0_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g1);
    			destroy_each(each_blocks, detaching);
    			if (detaching && g0_transition) g0_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(17:0) {#if $state.positions}",
    		ctx
    	});

    	return block;
    }

    // (20:6) {#each points as p}
    function create_each_block$c(ctx) {
    	let g;
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let text_1;
    	let t_value = /*p*/ ctx[3][0] + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;
    	let g_id_value;
    	let g_class_value;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			circle = svg_element("circle");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(circle, "cx", circle_cx_value = /*p*/ ctx[3][1][0]);
    			attr_dev(circle, "cy", circle_cy_value = /*p*/ ctx[3][1][1]);
    			attr_dev(circle, "r", "3");
    			attr_dev(circle, "class", "svelte-lt1npm");
    			toggle_class(circle, "active", /*$state*/ ctx[1].positions.includes(/*p*/ ctx[3][0]));
    			add_location(circle, file$q, 21, 10, 765);
    			set_style(text_1, "dominant-baseline", "central");
    			attr_dev(text_1, "x", text_1_x_value = /*p*/ ctx[3][1][0]);
    			attr_dev(text_1, "y", text_1_y_value = /*p*/ ctx[3][1][1]);
    			attr_dev(text_1, "class", "svelte-lt1npm");
    			toggle_class(text_1, "active", /*$state*/ ctx[1].positions.includes(/*p*/ ctx[3][0]));
    			add_location(text_1, file$q, 22, 10, 866);
    			attr_dev(g, "id", g_id_value = /*p*/ ctx[3][0]);
    			attr_dev(g, "class", g_class_value = "" + (null_to_empty(getClass(/*p*/ ctx[3][0])) + " svelte-lt1npm"));
    			add_location(g, file$q, 20, 8, 717);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, circle);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*points*/ 1 && circle_cx_value !== (circle_cx_value = /*p*/ ctx[3][1][0])) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*points*/ 1 && circle_cy_value !== (circle_cy_value = /*p*/ ctx[3][1][1])) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*$state, points*/ 3) {
    				toggle_class(circle, "active", /*$state*/ ctx[1].positions.includes(/*p*/ ctx[3][0]));
    			}

    			if (dirty & /*points*/ 1 && t_value !== (t_value = /*p*/ ctx[3][0] + "")) set_data_dev(t, t_value);

    			if (dirty & /*points*/ 1 && text_1_x_value !== (text_1_x_value = /*p*/ ctx[3][1][0])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*points*/ 1 && text_1_y_value !== (text_1_y_value = /*p*/ ctx[3][1][1])) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*$state, points*/ 3) {
    				toggle_class(text_1, "active", /*$state*/ ctx[1].positions.includes(/*p*/ ctx[3][0]));
    			}

    			if (dirty & /*points*/ 1 && g_id_value !== (g_id_value = /*p*/ ctx[3][0])) {
    				attr_dev(g, "id", g_id_value);
    			}

    			if (dirty & /*points*/ 1 && g_class_value !== (g_class_value = "" + (null_to_empty(getClass(/*p*/ ctx[3][0])) + " svelte-lt1npm"))) {
    				attr_dev(g, "class", g_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$c.name,
    		type: "each",
    		source: "(20:6) {#each points as p}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let if_block_anchor;
    	let if_block = /*$state*/ ctx[1].positions && create_if_block$a(ctx);

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
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$state*/ ctx[1].positions) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$state*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$a(ctx);
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
    			transition_in(if_block);
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getClass(p) {
    	if (("abcdefghi").includes(p)) return "green";
    	if (("ABCDEFGHIJKL").includes(p)) return "red";
    	if (("zy").includes(p)) return "yellow";
    	return "blue";
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let points;
    	let $shield;
    	let $state;
    	validate_store(shield, 'shield');
    	component_subscribe($$self, shield, $$value => $$invalidate(2, $shield = $$value));
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(1, $state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Positions', slots, []);
    	const writable_props = [];

    	Object_1$a.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Positions> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		state,
    		shield,
    		shieldPositions,
    		fade,
    		getClass,
    		points,
    		$shield,
    		$state
    	});

    	$$self.$inject_state = $$props => {
    		if ('points' in $$props) $$invalidate(0, points = $$props.points);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$shield*/ 4) {
    			// on shield change
    			$$invalidate(0, points = shieldPositions[$shield]
    			? Object.entries(shieldPositions[$shield])
    			: Object.entries(shieldPositions.spanish));
    		}
    	};

    	return [points, $state, $shield];
    }

    class Positions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Positions",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src\components\object\COA.svelte generated by Svelte v3.44.2 */
    const file$p = "src\\components\\object\\COA.svelte";

    // (23:2) {#if i === "Edit"}
    function create_if_block$9(ctx) {
    	let grid;
    	let positions;
    	let current;
    	grid = new Grid({ $$inline: true });
    	positions = new Positions({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(grid.$$.fragment);
    			create_component(positions.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(grid, target, anchor);
    			mount_component(positions, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(grid.$$.fragment, local);
    			transition_in(positions.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(grid.$$.fragment, local);
    			transition_out(positions.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(grid, detaching);
    			destroy_component(positions, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(23:2) {#if i === \\\"Edit\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let svg;
    	let shield_1;
    	let svg_id_value;
    	let current;

    	shield_1 = new Shield({
    			props: {
    				coa: /*coa*/ ctx[0],
    				border: /*$border*/ ctx[5],
    				borderWidth: /*$borderWidth*/ ctx[6],
    				type: /*i*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let if_block = /*i*/ ctx[1] === "Edit" && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			create_component(shield_1.$$.fragment);
    			if (if_block) if_block.c();
    			attr_dev(svg, "id", svg_id_value = "coa" + /*i*/ ctx[1]);
    			attr_dev(svg, "class", "coa");
    			attr_dev(svg, "width", /*w*/ ctx[2]);
    			attr_dev(svg, "height", /*h*/ ctx[3]);
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[4]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "xmlns:dc", "http://purl.org/dc/elements/1.1/");
    			attr_dev(svg, "xmlns:rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    			add_location(svg, file$p, 10, 0, 352);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			mount_component(shield_1, svg, null);
    			if (if_block) if_block.m(svg, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const shield_1_changes = {};
    			if (dirty & /*coa*/ 1) shield_1_changes.coa = /*coa*/ ctx[0];
    			if (dirty & /*$border*/ 32) shield_1_changes.border = /*$border*/ ctx[5];
    			if (dirty & /*$borderWidth*/ 64) shield_1_changes.borderWidth = /*$borderWidth*/ ctx[6];
    			if (dirty & /*i*/ 2) shield_1_changes.type = /*i*/ ctx[1];
    			shield_1.$set(shield_1_changes);

    			if (/*i*/ ctx[1] === "Edit") {
    				if (if_block) {
    					if (dirty & /*i*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(svg, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*i*/ 2 && svg_id_value !== (svg_id_value = "coa" + /*i*/ ctx[1])) {
    				attr_dev(svg, "id", svg_id_value);
    			}

    			if (!current || dirty & /*w*/ 4) {
    				attr_dev(svg, "width", /*w*/ ctx[2]);
    			}

    			if (!current || dirty & /*h*/ 8) {
    				attr_dev(svg, "height", /*h*/ ctx[3]);
    			}

    			if (!current || dirty & /*viewBox*/ 16) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shield_1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shield_1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_component(shield_1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let viewBox;
    	let $shield;
    	let $border;
    	let $borderWidth;
    	validate_store(shield, 'shield');
    	component_subscribe($$self, shield, $$value => $$invalidate(7, $shield = $$value));
    	validate_store(border, 'border');
    	component_subscribe($$self, border, $$value => $$invalidate(5, $border = $$value));
    	validate_store(borderWidth, 'borderWidth');
    	component_subscribe($$self, borderWidth, $$value => $$invalidate(6, $borderWidth = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('COA', slots, []);
    	let { coa, i, w, h } = $$props;
    	const writable_props = ['coa', 'i', 'w', 'h'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<COA> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('coa' in $$props) $$invalidate(0, coa = $$props.coa);
    		if ('i' in $$props) $$invalidate(1, i = $$props.i);
    		if ('w' in $$props) $$invalidate(2, w = $$props.w);
    		if ('h' in $$props) $$invalidate(3, h = $$props.h);
    	};

    	$$self.$capture_state = () => ({
    		Shield,
    		Grid,
    		Positions,
    		shield,
    		border,
    		borderWidth,
    		shieldBox,
    		coa,
    		i,
    		w,
    		h,
    		viewBox,
    		$shield,
    		$border,
    		$borderWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ('coa' in $$props) $$invalidate(0, coa = $$props.coa);
    		if ('i' in $$props) $$invalidate(1, i = $$props.i);
    		if ('w' in $$props) $$invalidate(2, w = $$props.w);
    		if ('h' in $$props) $$invalidate(3, h = $$props.h);
    		if ('viewBox' in $$props) $$invalidate(4, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$shield*/ 128) {
    			$$invalidate(4, viewBox = shieldBox[$shield] || "0 0 200 200");
    		}
    	};

    	return [coa, i, w, h, viewBox, $border, $borderWidth, $shield];
    }

    class COA extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { coa: 0, i: 1, w: 2, h: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "COA",
    			options,
    			id: create_fragment$p.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*coa*/ ctx[0] === undefined && !('coa' in props)) {
    			console.warn("<COA> was created without expected prop 'coa'");
    		}

    		if (/*i*/ ctx[1] === undefined && !('i' in props)) {
    			console.warn("<COA> was created without expected prop 'i'");
    		}

    		if (/*w*/ ctx[2] === undefined && !('w' in props)) {
    			console.warn("<COA> was created without expected prop 'w'");
    		}

    		if (/*h*/ ctx[3] === undefined && !('h' in props)) {
    			console.warn("<COA> was created without expected prop 'h'");
    		}
    	}

    	get coa() {
    		throw new Error("<COA>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set coa(value) {
    		throw new Error("<COA>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get i() {
    		throw new Error("<COA>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set i(value) {
    		throw new Error("<COA>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get w() {
    		throw new Error("<COA>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set w(value) {
    		throw new Error("<COA>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get h() {
    		throw new Error("<COA>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set h(value) {
    		throw new Error("<COA>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*///////////////////////////////////////////////////////////////////////////////////////////////////
    aleaPRNG 1.1
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    https://github.com/macmcmeans/aleaPRNG/blob/master/aleaPRNG-1.1.js
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    Original work copyright © 2010 Johannes Baagøe, under MIT license
    This is a derivative work copyright (c) 2017-2020, W. Mac" McMeans, under BSD license.
    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
    1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    ///////////////////////////////////////////////////////////////////////////////////////////////////*/
    function aleaPRNG() {
      return (function (args) {

        const version = "aleaPRNG 1.1.0";

        var s0,
          s1,
          s2,
          c,
          uinta = new Uint32Array(3),
          initialArgs,
          mashver = "";
        /* private: initializes generator with specified seed */
        function _initState(_internalSeed) {
          var mash = Mash();

          // internal state of generator
          s0 = mash(" ");
          s1 = mash(" ");
          s2 = mash(" ");

          c = 1;

          for (var i = 0; i < _internalSeed.length; i++) {
            s0 -= mash(_internalSeed[i]);
            if (s0 < 0) {
              s0 += 1;
            }

            s1 -= mash(_internalSeed[i]);
            if (s1 < 0) {
              s1 += 1;
            }

            s2 -= mash(_internalSeed[i]);
            if (s2 < 0) {
              s2 += 1;
            }
          }

          mashver = mash.version;

          mash = null;
        }

        /* private: dependent string hash function */
        function Mash() {
          var n = 4022871197; // 0xefc8249d

          var mash = function (data) {
            data = data.toString();

            // cache the length
            for (var i = 0, l = data.length; i < l; i++) {
              n += data.charCodeAt(i);

              var h = 0.02519603282416938 * n;

              n = h >>> 0;
              h -= n;
              h *= n;
              n = h >>> 0;
              h -= n;
              n += h * 4294967296; // 0x100000000      2^32
            }
            return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
          };

          mash.version = "Mash 0.9";
          return mash;
        }

        /* private: check if number is integer */
        function _isInteger(_int) {
          return parseInt(_int, 10) === _int;
        }

        /* public: return a 32-bit fraction in the range [0, 1]
          This is the main function returned when aleaPRNG is instantiated
          */
        var random = function () {
          var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32

          s0 = s1;
          s1 = s2;

          return (s2 = t - (c = t | 0));
        };

        /* public: return a 53-bit fraction in the range [0, 1] */
        random.fract53 = function () {
          return random() + ((random() * 0x200000) | 0) * 1.1102230246251565e-16; // 2^-53
        };

        /* public: return an unsigned integer in the range [0, 2^32] */
        random.int32 = function () {
          return random() * 0x100000000; // 2^32
        };

        /* public: advance the generator the specified amount of cycles */
        random.cycle = function (_run) {
          _run = typeof _run === "undefined" ? 1 : +_run;
          if (_run < 1) {
            _run = 1;
          }
          for (var i = 0; i < _run; i++) {
            random();
          }
        };

        /* public: return inclusive range */
        random.range = function () {
          var loBound, hiBound;

          if (arguments.length === 1) {
            loBound = 0;
            hiBound = arguments[0];
          } else {
            loBound = arguments[0];
            hiBound = arguments[1];
          }

          if (arguments[0] > arguments[1]) {
            loBound = arguments[1];
            hiBound = arguments[0];
          }

          // return integer
          if (_isInteger(loBound) && _isInteger(hiBound)) {
            return Math.floor(random() * (hiBound - loBound + 1)) + loBound;

            // return float
          } else {
            return random() * (hiBound - loBound) + loBound;
          }
        };

        /* public: initialize generator with the seed values used upon instantiation */
        random.restart = function () {
          _initState(initialArgs);
        };

        /* public: seeding function */
        random.seed = function () {
          _initState(Array.prototype.slice.call(arguments));
        };

        /* public: show the version of the RNG */
        random.version = function () {
          return version;
        };

        /* public: show the version of the RNG and the Mash string hasher */
        random.versions = function () {
          return version + ", " + mashver;
        };

        // when no seed is specified, create a random one from Windows Crypto (Monte Carlo application)
        if (args.length === 0) {
          window.crypto.getRandomValues(uinta);
          args = [uinta[0], uinta[1], uinta[2]];
        }

        // store the seed used when the RNG was instantiated, if any
        initialArgs = args;

        // initialize the RNG
        _initState(args);

        return random;
      })(Array.prototype.slice.call(arguments));
    }

    const createConfig = function () {
      return {
        usedPattern: null,
        usedTinctures: [],
        tData: get_store_value(tinctures),
        divisioned: null,
        ordinary: null
      };
    };

    // main generation routine
    const generate = function (seed = Math.floor(Math.random() * 1e9)) {
      Math.random = aleaPRNG(seed);

      const config = createConfig();
      const coa = {seed, t1: getTincture(config, "field")};

      let charge = P(config.usedPattern ? 0.5 : 0.93) ? true : false; // 80% for charge
      const linedOrdinary = (charge && P(0.3)) || P(0.5) ? rw(ordinaries.lined) : null;
      config.ordinary = (!charge && P(0.65)) || P(0.3) ? (linedOrdinary ? linedOrdinary : rw(ordinaries.straight)) : null; // 36% for ordinary

      const rareDivided = ["chief", "terrace", "chevron", "quarter", "flaunches"].includes(config.ordinary);
      config.divisioned = rareDivided ? P(0.03) : charge && config.ordinary ? P(0.03) : charge ? P(0.3) : config.ordinary ? P(0.7) : P(0.995); // 33% for division
      const division = config.divisioned ? rw(divisions.variants) : null;

      if (division) {
        const t = getTincture(config, "division", config.usedTinctures, P(0.98) ? coa.t1 : null);
        coa.division = {division, t};
        if (divisions[division]) coa.division.line = config.usedPattern || (config.ordinary && P(0.7)) ? "straight" : rw(divisions[division]);
      }

      if (config.ordinary) {
        coa.ordinaries = [
          {
            ordinary: config.ordinary,
            t: getTincture(config, "charge", config.usedTinctures, coa.t1)
          }
        ];
        if (linedOrdinary) coa.ordinaries[0].line = config.usedPattern || (division && P(0.7)) ? "straight" : rw(lines$1);
        if (division && !charge && !config.usedPattern && P(0.5) && config.ordinary !== "bordure" && config.ordinary !== "orle") {
          if (P(0.8)) coa.ordinaries[0].divided = "counter";
          // 40%
          else if (P(0.6)) coa.ordinaries[0].divided = "field";
          // 6%
          else coa.ordinaries[0].divided = "division"; // 4%
        }
      }

      if (charge) {
        charge = selectCharge(config);

        let p = "e",
          t = "gules";

        const ordinaryT = coa.ordinaries ? coa.ordinaries[0].t : null;
        if (positions.ordinariesOn[config.ordinary] && P(0.8)) {
          // place charge over config.ordinary (use tincture of field type)
          p = rw(positions.ordinariesOn[config.ordinary]);
          while (charges.natural[charge] === ordinaryT) charge = selectCharge(config);
          t = !config.usedPattern && P(0.3) ? coa.t1 : getTincture(config, "charge", [], ordinaryT);
        } else if (positions.ordinariesOff[config.ordinary] && P(0.95)) {
          // place charge out of config.ordinary (use tincture of ordinary type)
          p = rw(positions.ordinariesOff[config.ordinary]);
          while (charges.natural[charge] === coa.t1) charge = selectCharge(config);
          t = !config.usedPattern && P(0.3) ? ordinaryT : getTincture(config, "charge", config.usedTinctures, coa.t1);
        } else if (positions.divisions[division]) {
          // place charge in fields made by division
          p = rw(positions.divisions[division]);
          while (charges.natural[charge] === coa.t1) charge = selectCharge(config);
          t = getTincture(config, "charge", ordinaryT ? config.usedTinctures.concat(ordinaryT) : config.usedTinctures, coa.t1);
        } else if (positions[charge]) {
          // place charge-suitable position
          p = rw(positions[charge]);
          while (charges.natural[charge] === coa.t1) charge = selectCharge(config);
          t = getTincture(config, "charge", config.usedTinctures, coa.t1);
        } else {
          // place in standard position (use new tincture)
          p = config.usedPattern ? "e" : charges.conventional[charge] ? rw(positions.conventional) : rw(positions.complex);
          while (charges.natural[charge] === coa.t1) charge = selectCharge(config);
          t = getTincture(config, "charge", config.usedTinctures.concat(ordinaryT), coa.t1);
        }

        if (charges.natural[charge]) t = charges.natural[charge]; // natural tincture
        coa.charges = [{charge, t, p}];

        if (p === "ABCDEFGHIKL" && P(0.95)) {
          // add central charge if charge is in bordure
          coa.charges[0].charge = rw(charges.conventional);
          const charge = selectCharge(charges.single);
          const t = getTincture(config, "charge", config.usedTinctures, coa.t1);
          coa.charges.push({charge, t, p: "e"});
        } else if (P(0.8) && charge === "inescutcheon") {
          // add charge to inescutcheon
          const charge = selectCharge(charges.types);
          const t2 = getTincture(config, "charge", [], t);
          coa.charges.push({charge, t: t2, p, size: 0.5});
        } else if (division && !config.ordinary) {
          const allowCounter = !config.usedPattern && (!coa.line || coa.line === "straight");

          // dimidiation: second charge at division basic positons
          if (P(0.3) && ["perPale", "perFess"].includes(division) && coa.line === "straight") {
            coa.charges[0].divided = "field";
            if (P(0.95)) {
              const p2 = p === "e" || P(0.5) ? "e" : rw(positions.divisions[division]);
              const charge = selectCharge(charges.single);
              const t = getTincture(config, "charge", config.usedTinctures, coa.division.t);
              coa.charges.push({charge, t, p: p2, divided: "division"});
            }
          } else if (allowCounter && P(0.4)) coa.charges[0].divided = "counter";
          // counterchanged, 40%
          else if (["perPale", "perFess", "perBend", "perBendSinister"].includes(division) && P(0.8)) {
            // place 2 charges in division standard positions
            const [p1, p2] = division === "perPale" ? ["p", "q"] : division === "perFess" ? ["k", "n"] : division === "perBend" ? ["l", "m"] : ["j", "o"]; // perBendSinister
            coa.charges[0].p = p1;

            const charge = selectCharge(charges.single);
            const t = getTincture(config, "charge", config.usedTinctures, coa.division.t);
            coa.charges.push({charge, t, p: p2});
          } else if (["perCross", "perSaltire"].includes(division) && P(0.5)) {
            // place 4 charges in division standard positions
            const [p1, p2, p3, p4] = division === "perCross" ? ["j", "l", "m", "o"] : ["b", "d", "f", "h"];
            coa.charges[0].p = p1;

            const c2 = selectCharge(charges.single);
            const t2 = getTincture(config, "charge", [], coa.division.t);

            const c3 = selectCharge(charges.single);
            const t3 = getTincture(config, "charge", [], coa.division.t);

            const c4 = selectCharge(charges.single);
            const t4 = getTincture(config, "charge", [], coa.t1);
            coa.charges.push({charge: c2, t: t2, p: p2}, {charge: c3, t: t3, p: p3}, {charge: c4, t: t4, p: p4});
          } else if (allowCounter && p.length > 1) coa.charges[0].divided = "counter"; // counterchanged, 40%
        }

        coa.charges.forEach(c => defineChargeAttributes(config, division, c));
      }

      return coa;
    };

    const getSize = (p, o = null, d = null) => {
      if (p === "e" && (o === "bordure" || o === "orle")) return 1.1;
      if (p === "e") return 1.5;
      if (p === "jln" || p === "jlh") return 0.7;
      if (p === "abcpqh" || p === "ez" || p === "be") return 0.5;
      if (["a", "b", "c", "d", "f", "g", "h", "i", "bh", "df"].includes(p)) return 0.5;
      if (["j", "l", "m", "o", "jlmo"].includes(p) && d === "perCross") return 0.6;
      if (p.length > 10) return 0.18; // >10 (bordure)
      if (p.length > 7) return 0.3; // 8, 9, 10
      if (p.length > 4) return 0.4; // 5, 6, 7
      if (p.length > 2) return 0.5; // 3, 4
      return 0.7; // 1, 2
    };

    function defineChargeAttributes(config, division, c) {
      // define size
      c.size = (c.size || 1) * getSize(c.p, config.ordinary, division);

      // clean-up position
      c.p = [...new Set(c.p)].join("");

      // define orientation
      if (P(0.02) && charges.sinister.includes(c.charge)) c.sinister = 1;
      if (P(0.02) && charges.reversed.includes(c.charge)) c.reversed = 1;
    }

    function selectCharge(config, set) {
      const type = set ? rw(set) : config.ordinary || config.divisioned ? rw(charges.types) : rw(charges.single);
      return type === "inescutcheon" ? "inescutcheon" : rw(charges[type]);
    }

    function replaceTincture(config, t, n) {
      const type = getType(config, t);
      while (!n || n === t) {
        n = rw(config.tData[type]);
      }
      return n;
    }

    function getType(config, t) {
      const tincture = t.includes("-") ? t.split("-")[1] : t;
      if (Object.keys(config.tData.metals).includes(tincture)) return "metals";
      if (Object.keys(config.tData.colours).includes(tincture)) return "colours";
      if (Object.keys(config.tData.stains).includes(tincture)) return "stains";
      debugger; // exception
    }

    function definePattern(config, pattern, element) {
      let t1 = null,
        t2 = null;

      // apply standard tinctures
      if (P(0.5) && (pattern.includes("air") || pattern.includes("otent"))) {
        t1 = "argent";
        t2 = "azure";
      } else if (pattern === "ermine") {
        if (P(0.7)) {
          t1 = "argent";
          t2 = "sable";
        } else if (P(0.3)) {
          t1 = "sable";
          t2 = "argent";
        } else if (P(0.1)) {
          t1 = "or";
          t2 = "sable";
        } else if (P(0.1)) {
          t1 = "sable";
          t2 = "or";
        } else if (P(0.1)) {
          t1 = "gules";
          t2 = "argent";
        }
      } else if (pattern.includes("pappellony") || pattern === "scaly") {
        if (P(0.2)) {
          t1 = "gules";
          t2 = "or";
        } else if (P(0.2)) {
          t1 = "sable";
          t2 = "argent";
        } else if (P(0.2)) {
          t1 = "argent";
          t2 = "sable";
        } else if (P(0.2)) {
          t1 = "azure";
          t2 = "argent";
        }
      } else if (P(0.2) && pattern === "plumetty") {
        t1 = "gules";
        t2 = "or";
      } else if (pattern === "masoned") {
        if (P(0.3)) {
          t1 = "gules";
          t2 = "argent";
        } else if (P(0.3)) {
          t1 = "argent";
          t2 = "sable";
        } else if (P(0.1)) {
          t1 = "or";
          t2 = "sable";
        }
      } else if (pattern === "fretty" || pattern === "grillage" || pattern === "chainy") {
        if (P(0.35)) {
          t1 = "argent";
          t2 = "gules";
        } else if (P(0.1)) {
          t1 = "sable";
          t2 = "or";
        } else if (P(0.2)) {
          t1 = "gules";
          t2 = "argent";
        }
      } else if (pattern === "honeycombed") {
        if (P(0.4)) {
          t1 = "sable";
          t2 = "or";
        } else if (P(0.3)) {
          t1 = "or";
          t2 = "sable";
        }
      } else if (pattern === "semy") pattern += "_of_" + selectCharge(charges.semy);

      if (!t1 || !t2) {
        const startWithMetal = P(0.7);
        t1 = startWithMetal ? rw(config.tData.metals) : rw(config.tData.colours);
        t2 = startWithMetal ? rw(config.tData.colours) : rw(config.tData.metals);
      }

      // division should not be the same tincture as base field
      if (element === "division") {
        if (config.usedTinctures.includes(t1)) t1 = replaceTincture(config, t1);
        if (config.usedTinctures.includes(t2)) t2 = replaceTincture(config, t2);
      }

      config.usedTinctures.push(t1, t2);
      const size = rw(patternSize);
      const sizeString = size === "standard" ? "" : "-" + size;

      return `${pattern}-${t1}-${t2}${sizeString}`;
    }

    // select tincture: element type (field, division, charge), used field tinctures, field type to follow RoT
    function getTincture(config, element, fields = [], RoT) {
      const base = RoT ? (RoT.includes("-") ? RoT.split("-")[1] : RoT) : null;

      let type = rw(config.tData[element]); // metals, colours, stains, patterns
      if (RoT && type !== "patterns") type = getType(config, base) === "metals" ? "colours" : "metals"; // follow RoT
      if (type === "metals" && fields.includes("or") && fields.includes("argent")) type = "colours"; // exclude metals overuse
      let tincture = rw(config.tData[type]);

      while (tincture === base || fields.includes(tincture)) {
        tincture = rw(config.tData[type]);
      } // follow RoT

      if (type !== "patterns" && element !== "charge") config.usedTinctures.push(tincture); // add field tincture

      if (type === "patterns") {
        config.usedPattern = tincture;
        tincture = definePattern(config, tincture, element);
      }

      return tincture;
    }

    /* src\components\navigation\Viewer.svelte generated by Svelte v3.44.2 */
    const file$o = "src\\components\\navigation\\Viewer.svelte";

    function create_fragment$o(ctx) {
    	let div;
    	let coa_1;
    	let current;
    	let mounted;
    	let dispose;

    	coa_1 = new COA({
    			props: {
    				coa: /*coa*/ ctx[1],
    				i: "View",
    				w: /*coaSize*/ ctx[0],
    				h: /*coaSize*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(coa_1.$$.fragment);
    			attr_dev(div, "id", "viewer");
    			add_location(div, file$o, 16, 0, 473);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(coa_1, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", edit, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const coa_1_changes = {};
    			if (dirty & /*coaSize*/ 1) coa_1_changes.w = /*coaSize*/ ctx[0];
    			if (dirty & /*coaSize*/ 1) coa_1_changes.h = /*coaSize*/ ctx[0];
    			coa_1.$set(coa_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(coa_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(coa_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(coa_1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function edit() {
    	if ((/noedit/i).test(window.location.search)) return;
    	const URL = window.location.href.replace("view=1", "view=0");
    	const win = window.open(URL, "_blank");
    	win.focus();
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let $history;
    	validate_store(history, 'history');
    	component_subscribe($$self, history, $$value => $$invalidate(4, $history = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Viewer', slots, []);
    	let { c, seed, coaSize } = $$props;
    	let coa = $history[c] || generate(seed || undefined); // on load
    	const writable_props = ['c', 'seed', 'coaSize'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Viewer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('c' in $$props) $$invalidate(2, c = $$props.c);
    		if ('seed' in $$props) $$invalidate(3, seed = $$props.seed);
    		if ('coaSize' in $$props) $$invalidate(0, coaSize = $$props.coaSize);
    	};

    	$$self.$capture_state = () => ({
    		COA,
    		history,
    		generate,
    		c,
    		seed,
    		coaSize,
    		coa,
    		edit,
    		$history
    	});

    	$$self.$inject_state = $$props => {
    		if ('c' in $$props) $$invalidate(2, c = $$props.c);
    		if ('seed' in $$props) $$invalidate(3, seed = $$props.seed);
    		if ('coaSize' in $$props) $$invalidate(0, coaSize = $$props.coaSize);
    		if ('coa' in $$props) $$invalidate(1, coa = $$props.coa);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [coaSize, coa, c, seed];
    }

    class Viewer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { c: 2, seed: 3, coaSize: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Viewer",
    			options,
    			id: create_fragment$o.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*c*/ ctx[2] === undefined && !('c' in props)) {
    			console.warn("<Viewer> was created without expected prop 'c'");
    		}

    		if (/*seed*/ ctx[3] === undefined && !('seed' in props)) {
    			console.warn("<Viewer> was created without expected prop 'seed'");
    		}

    		if (/*coaSize*/ ctx[0] === undefined && !('coaSize' in props)) {
    			console.warn("<Viewer> was created without expected prop 'coaSize'");
    		}
    	}

    	get c() {
    		throw new Error("<Viewer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set c(value) {
    		throw new Error("<Viewer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get seed() {
    		throw new Error("<Viewer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set seed(value) {
    		throw new Error("<Viewer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get coaSize() {
    		throw new Error("<Viewer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set coaSize(value) {
    		throw new Error("<Viewer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorType.svelte generated by Svelte v3.44.2 */

    const file$n = "src\\components\\editor\\EditorType.svelte";

    function create_fragment$n(ctx) {
    	let t0;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = text("Type:\r\n");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Tincture";
    			option1 = element("option");
    			option1.textContent = "Pattern";
    			option2 = element("option");
    			option2.textContent = "Semy";
    			option0.__value = "tincture";
    			option0.value = option0.__value;
    			add_location(option0, file$n, 6, 2, 80);
    			option1.__value = "pattern";
    			option1.value = option1.__value;
    			add_location(option1, file$n, 7, 2, 126);
    			option2.__value = "semy";
    			option2.value = option2.__value;
    			add_location(option2, file$n, 8, 2, 170);
    			if (/*type*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[1].call(select));
    			add_location(select, file$n, 5, 0, 50);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*type*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*type*/ 1) {
    				select_option(select, /*type*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(select);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorType', slots, []);
    	let { type } = $$props;
    	const writable_props = ['type'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorType> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		type = select_value(this);
    		$$invalidate(0, type);
    	}

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    	};

    	$$self.$capture_state = () => ({ type });

    	$$self.$inject_state = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, select_change_handler];
    }

    class EditorType extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { type: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorType",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*type*/ ctx[0] === undefined && !('type' in props)) {
    			console.warn("<EditorType> was created without expected prop 'type'");
    		}
    	}

    	get type() {
    		throw new Error("<EditorType>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<EditorType>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorSize.svelte generated by Svelte v3.44.2 */

    const file$m = "src\\components\\editor\\EditorSize.svelte";

    function create_fragment$m(ctx) {
    	let span;
    	let t1;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Size:";
    			t1 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Bigger";
    			option1 = element("option");
    			option1.textContent = "Big";
    			option2 = element("option");
    			option2.textContent = "Standard";
    			option3 = element("option");
    			option3.textContent = "Small";
    			option4 = element("option");
    			option4.textContent = "Smaller";
    			option5 = element("option");
    			option5.textContent = "Smallest";
    			set_style(span, "margin-left", "1em");
    			add_location(span, file$m, 4, 0, 43);
    			option0.__value = "bigger";
    			option0.value = option0.__value;
    			add_location(option0, file$m, 6, 2, 118);
    			option1.__value = "big";
    			option1.value = option1.__value;
    			add_location(option1, file$m, 7, 2, 160);
    			option2.__value = "standard";
    			option2.value = option2.__value;
    			add_location(option2, file$m, 8, 2, 196);
    			option3.__value = "small";
    			option3.value = option3.__value;
    			add_location(option3, file$m, 9, 2, 242);
    			option4.__value = "smaller";
    			option4.value = option4.__value;
    			add_location(option4, file$m, 10, 2, 282);
    			option5.__value = "smallest";
    			option5.value = option5.__value;
    			add_location(option5, file$m, 11, 2, 326);
    			if (/*size*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[1].call(select));
    			add_location(select, file$m, 5, 0, 88);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			append_dev(select, option4);
    			append_dev(select, option5);
    			select_option(select, /*size*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 1) {
    				select_option(select, /*size*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(select);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorSize', slots, []);
    	let { size } = $$props;
    	const writable_props = ['size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorSize> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		size = select_value(this);
    		$$invalidate(0, size);
    	}

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ size });

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, select_change_handler];
    }

    class EditorSize extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { size: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorSize",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*size*/ ctx[0] === undefined && !('size' in props)) {
    			console.warn("<EditorSize> was created without expected prop 'size'");
    		}
    	}

    	get size() {
    		throw new Error("<EditorSize>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<EditorSize>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorItem.svelte generated by Svelte v3.44.2 */
    const file$l = "src\\components\\editor\\EditorItem.svelte";

    function create_fragment$l(ctx) {
    	let svg;
    	let shield;
    	let svg_data_tooltip_value;
    	let current;
    	let mounted;
    	let dispose;

    	shield = new Shield({
    			props: {
    				coa: /*coa*/ ctx[0],
    				i: /*i*/ ctx[3],
    				border: "#333",
    				borderWidth: "2",
    				type: "menuItem"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			create_component(shield.$$.fragment);
    			attr_dev(svg, "class", "menuItem");
    			attr_dev(svg, "width", /*itemSize*/ ctx[2]);
    			attr_dev(svg, "height", /*itemSize*/ ctx[2]);
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			attr_dev(svg, "data-tooltip", svg_data_tooltip_value = capitalize(/*tip*/ ctx[1]));
    			add_location(svg, file$l, 9, 0, 245);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			mount_component(shield, svg, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(tooltip.call(null, svg));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const shield_changes = {};
    			if (dirty & /*coa*/ 1) shield_changes.coa = /*coa*/ ctx[0];
    			shield.$set(shield_changes);

    			if (!current || dirty & /*itemSize*/ 4) {
    				attr_dev(svg, "width", /*itemSize*/ ctx[2]);
    			}

    			if (!current || dirty & /*itemSize*/ 4) {
    				attr_dev(svg, "height", /*itemSize*/ ctx[2]);
    			}

    			if (!current || dirty & /*tip*/ 2 && svg_data_tooltip_value !== (svg_data_tooltip_value = capitalize(/*tip*/ ctx[1]))) {
    				attr_dev(svg, "data-tooltip", svg_data_tooltip_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_component(shield);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorItem', slots, []);
    	let { coa, tip, itemSize } = $$props;
    	const i = Math.floor(1e6 * Math.random());
    	const writable_props = ['coa', 'tip', 'itemSize'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('coa' in $$props) $$invalidate(0, coa = $$props.coa);
    		if ('tip' in $$props) $$invalidate(1, tip = $$props.tip);
    		if ('itemSize' in $$props) $$invalidate(2, itemSize = $$props.itemSize);
    	};

    	$$self.$capture_state = () => ({
    		Shield,
    		tooltip,
    		capitalize,
    		coa,
    		tip,
    		itemSize,
    		i
    	});

    	$$self.$inject_state = $$props => {
    		if ('coa' in $$props) $$invalidate(0, coa = $$props.coa);
    		if ('tip' in $$props) $$invalidate(1, tip = $$props.tip);
    		if ('itemSize' in $$props) $$invalidate(2, itemSize = $$props.itemSize);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [coa, tip, itemSize, i];
    }

    class EditorItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { coa: 0, tip: 1, itemSize: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorItem",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*coa*/ ctx[0] === undefined && !('coa' in props)) {
    			console.warn("<EditorItem> was created without expected prop 'coa'");
    		}

    		if (/*tip*/ ctx[1] === undefined && !('tip' in props)) {
    			console.warn("<EditorItem> was created without expected prop 'tip'");
    		}

    		if (/*itemSize*/ ctx[2] === undefined && !('itemSize' in props)) {
    			console.warn("<EditorItem> was created without expected prop 'itemSize'");
    		}
    	}

    	get coa() {
    		throw new Error("<EditorItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set coa(value) {
    		throw new Error("<EditorItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tip() {
    		throw new Error("<EditorItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tip(value) {
    		throw new Error("<EditorItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemSize() {
    		throw new Error("<EditorItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemSize(value) {
    		throw new Error("<EditorItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorTincture.svelte generated by Svelte v3.44.2 */

    const { Object: Object_1$9 } = globals;
    const file$k = "src\\components\\editor\\EditorTincture.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (16:0) {#each coas as coa}
    function create_each_block$b(ctx) {
    	let div;
    	let editoritem;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	editoritem = new EditorItem({
    			props: {
    				coa: /*coa*/ ctx[5],
    				tip: /*coa*/ ctx[5].tip,
    				itemSize: /*itemSize*/ ctx[1]
    			},
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*coa*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editoritem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*t1*/ ctx[0] === /*coa*/ ctx[5].t1);
    			add_location(div, file$k, 16, 2, 405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editoritem, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const editoritem_changes = {};
    			if (dirty & /*itemSize*/ 2) editoritem_changes.itemSize = /*itemSize*/ ctx[1];
    			editoritem.$set(editoritem_changes);

    			if (dirty & /*t1, coas*/ 5) {
    				toggle_class(div, "selected", /*t1*/ ctx[0] === /*coa*/ ctx[5].t1);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editoritem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editoritem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editoritem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(16:0) {#each coas as coa}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let div;
    	let t1_1;
    	let each_1_anchor;
    	let current;
    	let each_value = /*coas*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Tincture:";
    			t1_1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(div, file$k, 14, 0, 360);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t1_1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*t1, coas, itemSize*/ 7) {
    				each_value = /*coas*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$b(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$b(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    			if (detaching) detach_dev(t1_1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $tinctures;
    	validate_store(tinctures, 'tinctures');
    	component_subscribe($$self, tinctures, $$value => $$invalidate(4, $tinctures = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorTincture', slots, []);
    	let { t1, itemSize } = $$props;

    	const coas = ["metals", "colours", "stains"].map(type => {
    		return Object.keys($tinctures[type]).map(t => {
    			return { t1: t, tip: `${type.slice(0, -1)}: ${t}` };
    		});
    	}).flat();

    	const writable_props = ['t1', 'itemSize'];

    	Object_1$9.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorTincture> was created with unknown prop '${key}'`);
    	});

    	const click_handler = coa => $$invalidate(0, t1 = coa.t1);

    	$$self.$$set = $$props => {
    		if ('t1' in $$props) $$invalidate(0, t1 = $$props.t1);
    		if ('itemSize' in $$props) $$invalidate(1, itemSize = $$props.itemSize);
    	};

    	$$self.$capture_state = () => ({
    		EditorItem,
    		tinctures,
    		t1,
    		itemSize,
    		coas,
    		$tinctures
    	});

    	$$self.$inject_state = $$props => {
    		if ('t1' in $$props) $$invalidate(0, t1 = $$props.t1);
    		if ('itemSize' in $$props) $$invalidate(1, itemSize = $$props.itemSize);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [t1, itemSize, coas, click_handler];
    }

    class EditorTincture extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { t1: 0, itemSize: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorTincture",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*t1*/ ctx[0] === undefined && !('t1' in props)) {
    			console.warn("<EditorTincture> was created without expected prop 't1'");
    		}

    		if (/*itemSize*/ ctx[1] === undefined && !('itemSize' in props)) {
    			console.warn("<EditorTincture> was created without expected prop 'itemSize'");
    		}
    	}

    	get t1() {
    		throw new Error("<EditorTincture>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t1(value) {
    		throw new Error("<EditorTincture>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemSize() {
    		throw new Error("<EditorTincture>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemSize(value) {
    		throw new Error("<EditorTincture>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorPattern.svelte generated by Svelte v3.44.2 */

    const { Object: Object_1$8 } = globals;
    const file$j = "src\\components\\editor\\EditorPattern.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (18:0) {#each coas as coa}
    function create_each_block$a(ctx) {
    	let div;
    	let editoritem;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	editoritem = new EditorItem({
    			props: {
    				coa: /*coa*/ ctx[8],
    				tip: /*coa*/ ctx[8].pattern,
    				itemSize: /*itemSize*/ ctx[1]
    			},
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*coa*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editoritem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*pattern*/ ctx[0] === /*coa*/ ctx[8].pattern);
    			add_location(div, file$j, 18, 2, 573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editoritem, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const editoritem_changes = {};
    			if (dirty & /*coas*/ 4) editoritem_changes.coa = /*coa*/ ctx[8];
    			if (dirty & /*coas*/ 4) editoritem_changes.tip = /*coa*/ ctx[8].pattern;
    			if (dirty & /*itemSize*/ 2) editoritem_changes.itemSize = /*itemSize*/ ctx[1];
    			editoritem.$set(editoritem_changes);

    			if (dirty & /*pattern, coas*/ 5) {
    				toggle_class(div, "selected", /*pattern*/ ctx[0] === /*coa*/ ctx[8].pattern);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editoritem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editoritem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editoritem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(18:0) {#each coas as coa}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div;
    	let t1_1;
    	let each_1_anchor;
    	let current;
    	let each_value = /*coas*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Pattern:";
    			t1_1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(div, file$j, 16, 0, 529);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t1_1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pattern, coas, itemSize*/ 7) {
    				each_value = /*coas*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    			if (detaching) detach_dev(t1_1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let coas;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorPattern', slots, []);
    	let { pattern, t1, t2, size, itemSize } = $$props;
    	const patterns = Object.keys(defaultTinctures.patterns).filter(pattern => pattern !== "semy");

    	// clean group
    	document.getElementById("patterns").innerHTML = "";

    	const writable_props = ['pattern', 't1', 't2', 'size', 'itemSize'];

    	Object_1$8.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorPattern> was created with unknown prop '${key}'`);
    	});

    	const click_handler = coa => $$invalidate(0, pattern = coa.pattern);

    	$$self.$$set = $$props => {
    		if ('pattern' in $$props) $$invalidate(0, pattern = $$props.pattern);
    		if ('t1' in $$props) $$invalidate(3, t1 = $$props.t1);
    		if ('t2' in $$props) $$invalidate(4, t2 = $$props.t2);
    		if ('size' in $$props) $$invalidate(5, size = $$props.size);
    		if ('itemSize' in $$props) $$invalidate(1, itemSize = $$props.itemSize);
    	};

    	$$self.$capture_state = () => ({
    		EditorItem,
    		defaultTinctures,
    		pattern,
    		t1,
    		t2,
    		size,
    		itemSize,
    		patterns,
    		coas
    	});

    	$$self.$inject_state = $$props => {
    		if ('pattern' in $$props) $$invalidate(0, pattern = $$props.pattern);
    		if ('t1' in $$props) $$invalidate(3, t1 = $$props.t1);
    		if ('t2' in $$props) $$invalidate(4, t2 = $$props.t2);
    		if ('size' in $$props) $$invalidate(5, size = $$props.size);
    		if ('itemSize' in $$props) $$invalidate(1, itemSize = $$props.itemSize);
    		if ('coas' in $$props) $$invalidate(2, coas = $$props.coas);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*t1, t2, size*/ 56) {
    			$$invalidate(2, coas = patterns.map(pattern => {
    				let tincture = `${pattern}-${t1}-${t2}`;
    				if (size !== "standard") tincture += `-${size}`;
    				return { pattern, t1: tincture };
    			}));
    		}
    	};

    	return [pattern, itemSize, coas, t1, t2, size, click_handler];
    }

    class EditorPattern extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			pattern: 0,
    			t1: 3,
    			t2: 4,
    			size: 5,
    			itemSize: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorPattern",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pattern*/ ctx[0] === undefined && !('pattern' in props)) {
    			console.warn("<EditorPattern> was created without expected prop 'pattern'");
    		}

    		if (/*t1*/ ctx[3] === undefined && !('t1' in props)) {
    			console.warn("<EditorPattern> was created without expected prop 't1'");
    		}

    		if (/*t2*/ ctx[4] === undefined && !('t2' in props)) {
    			console.warn("<EditorPattern> was created without expected prop 't2'");
    		}

    		if (/*size*/ ctx[5] === undefined && !('size' in props)) {
    			console.warn("<EditorPattern> was created without expected prop 'size'");
    		}

    		if (/*itemSize*/ ctx[1] === undefined && !('itemSize' in props)) {
    			console.warn("<EditorPattern> was created without expected prop 'itemSize'");
    		}
    	}

    	get pattern() {
    		throw new Error("<EditorPattern>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pattern(value) {
    		throw new Error("<EditorPattern>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t1() {
    		throw new Error("<EditorPattern>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t1(value) {
    		throw new Error("<EditorPattern>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t2() {
    		throw new Error("<EditorPattern>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t2(value) {
    		throw new Error("<EditorPattern>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<EditorPattern>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<EditorPattern>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemSize() {
    		throw new Error("<EditorPattern>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemSize(value) {
    		throw new Error("<EditorPattern>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorCharge.svelte generated by Svelte v3.44.2 */

    const { Object: Object_1$7 } = globals;
    const file$i = "src\\components\\editor\\EditorCharge.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (58:0) {:else}
    function create_else_block$4(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Category:";
    			attr_dev(span, "class", "svelte-mg0vr7");
    			toggle_class(span, "indented", /*division*/ ctx[2]);
    			add_location(span, file$i, 58, 2, 1590);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*division*/ 4) {
    				toggle_class(span, "indented", /*division*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(58:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:0) {#if type === "semy"}
    function create_if_block$8(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Charge:";
    			add_location(span, file$i, 56, 2, 1557);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(56:0) {#if type === \\\"semy\\\"}",
    		ctx
    	});

    	return block;
    }

    // (62:2) {#each categories as type}
    function create_each_block_1$2(ctx) {
    	let option;
    	let t_value = /*cap*/ ctx[8](/*type*/ ctx[4]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*type*/ ctx[4];
    			option.value = option.__value;
    			add_location(option, file$i, 62, 4, 1766);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(62:2) {#each categories as type}",
    		ctx
    	});

    	return block;
    }

    // (71:2) {#each coas as coa (coa)}
    function create_each_block$9(key_1, ctx) {
    	let div;
    	let editoritem;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	editoritem = new EditorItem({
    			props: {
    				coa: /*coa*/ ctx[25],
    				tip: /*getTip*/ ctx[9](/*coa*/ ctx[25].c),
    				itemSize: /*itemSize*/ ctx[3]
    			},
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[18](/*coa*/ ctx[25]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(editoritem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*charge*/ ctx[1] === /*coa*/ ctx[25].c);
    			add_location(div, file$i, 71, 4, 1973);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editoritem, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const editoritem_changes = {};
    			if (dirty & /*coas*/ 64) editoritem_changes.coa = /*coa*/ ctx[25];
    			if (dirty & /*coas*/ 64) editoritem_changes.tip = /*getTip*/ ctx[9](/*coa*/ ctx[25].c);
    			if (dirty & /*itemSize*/ 8) editoritem_changes.itemSize = /*itemSize*/ ctx[3];
    			editoritem.$set(editoritem_changes);

    			if (dirty & /*charge, coas*/ 66) {
    				toggle_class(div, "selected", /*charge*/ ctx[1] === /*coa*/ ctx[25].c);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editoritem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editoritem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editoritem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(71:2) {#each coas as coa (coa)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let t0;
    	let select;
    	let t1_1;
    	let span;
    	let t3;
    	let input;
    	let t4;
    	let div;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[4] === "semy") return create_if_block$8;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value_1 = /*categories*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = /*coas*/ ctx[6];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*coa*/ ctx[25];
    	validate_each_keys(ctx, each_value, get_each_context$9, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$9(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$9(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			if_block.c();
    			t0 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1_1 = space();
    			span = element("span");
    			span.textContent = "Search:";
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "svelte-mg0vr7");
    			if (/*category*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[15].call(select));
    			toggle_class(select, "inactive", /*query*/ ctx[5]);
    			add_location(select, file$i, 60, 0, 1647);
    			attr_dev(span, "class", "svelte-mg0vr7");
    			toggle_class(span, "indented", true);
    			add_location(span, file$i, 66, 0, 1833);
    			attr_dev(input, "class", "svelte-mg0vr7");
    			toggle_class(input, "inactive", !/*query*/ ctx[5]);
    			add_location(input, file$i, 67, 0, 1877);
    			add_location(div, file$i, 69, 0, 1933);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*category*/ ctx[0]);
    			insert_dev(target, t1_1, anchor);
    			insert_dev(target, span, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*query*/ ctx[5]);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[15]),
    					listen_dev(select, "input", /*input_handler*/ ctx[16], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[17])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			}

    			if (dirty & /*categories, cap*/ 384) {
    				each_value_1 = /*categories*/ ctx[7];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*category, categories*/ 129) {
    				select_option(select, /*category*/ ctx[0]);
    			}

    			if (dirty & /*query*/ 32) {
    				toggle_class(select, "inactive", /*query*/ ctx[5]);
    			}

    			if (dirty & /*query*/ 32 && input.value !== /*query*/ ctx[5]) {
    				set_input_value(input, /*query*/ ctx[5]);
    			}

    			if (dirty & /*query*/ 32) {
    				toggle_class(input, "inactive", !/*query*/ ctx[5]);
    			}

    			if (dirty & /*charge, coas, getTip, itemSize*/ 586) {
    				each_value = /*coas*/ ctx[6];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$9, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each1_lookup, div, outro_and_destroy_block, create_each_block$9, null, get_each_context$9);
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
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t1_1);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorCharge', slots, []);
    	let { charge, type, category, t1, t2, size = null, sinister = null, reversed = null, division = false, itemSize } = $$props;
    	let coas = [], query, queryOld;
    	const categories = Object.keys(charges.types);
    	const allCharges = categories.map(category => Object.keys(charges[category])).flat();
    	const cap = string => string.charAt(0).toUpperCase() + string.slice(1);

    	function update() {
    		const chargeList = Object.keys(charges[category]);

    		$$invalidate(6, coas = chargeList.map(c => new Object({
    				c,
    				t1: getTincture(c),
    				charges: getCharge(c)
    			})));
    	}

    	function showResults(query) {
    		if (!query && query !== queryOld) update();
    		queryOld = query;
    		if (!query) return;
    		const regEx = new RegExp(query.replaceAll(" ", ""), "i");
    		const results = allCharges.filter(c => regEx.test(c));

    		$$invalidate(6, coas = results.map(c => new Object({
    				c,
    				t1: getTincture(c),
    				charges: getCharge(c)
    			})));
    	}

    	function getTincture(c) {
    		if (type === "semy") return `semy_of_${c}-${t1}-${t2}-${size}`;
    		return t1;
    	}

    	function getCharge(c) {
    		if (type === "semy") return [];

    		return [
    			{
    				charge: c,
    				t: t2,
    				p: "e",
    				size: 1.5,
    				sinister,
    				reversed
    			}
    		];
    	}

    	function getTip(c) {
    		if (type === "semy") return `Semy of ${c}`;
    		return `Charge: ${c}`;
    	}

    	const writable_props = [
    		'charge',
    		'type',
    		'category',
    		't1',
    		't2',
    		'size',
    		'sinister',
    		'reversed',
    		'division',
    		'itemSize'
    	];

    	Object_1$7.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorCharge> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		category = select_value(this);
    		$$invalidate(0, category);
    		$$invalidate(7, categories);
    	}

    	const input_handler = () => $$invalidate(5, query = "");

    	function input_input_handler() {
    		query = this.value;
    		$$invalidate(5, query);
    	}

    	const click_handler = coa => $$invalidate(1, charge = coa.c);

    	$$self.$$set = $$props => {
    		if ('charge' in $$props) $$invalidate(1, charge = $$props.charge);
    		if ('type' in $$props) $$invalidate(4, type = $$props.type);
    		if ('category' in $$props) $$invalidate(0, category = $$props.category);
    		if ('t1' in $$props) $$invalidate(10, t1 = $$props.t1);
    		if ('t2' in $$props) $$invalidate(11, t2 = $$props.t2);
    		if ('size' in $$props) $$invalidate(12, size = $$props.size);
    		if ('sinister' in $$props) $$invalidate(13, sinister = $$props.sinister);
    		if ('reversed' in $$props) $$invalidate(14, reversed = $$props.reversed);
    		if ('division' in $$props) $$invalidate(2, division = $$props.division);
    		if ('itemSize' in $$props) $$invalidate(3, itemSize = $$props.itemSize);
    	};

    	$$self.$capture_state = () => ({
    		EditorItem,
    		charges,
    		charge,
    		type,
    		category,
    		t1,
    		t2,
    		size,
    		sinister,
    		reversed,
    		division,
    		itemSize,
    		coas,
    		query,
    		queryOld,
    		categories,
    		allCharges,
    		cap,
    		update,
    		showResults,
    		getTincture,
    		getCharge,
    		getTip
    	});

    	$$self.$inject_state = $$props => {
    		if ('charge' in $$props) $$invalidate(1, charge = $$props.charge);
    		if ('type' in $$props) $$invalidate(4, type = $$props.type);
    		if ('category' in $$props) $$invalidate(0, category = $$props.category);
    		if ('t1' in $$props) $$invalidate(10, t1 = $$props.t1);
    		if ('t2' in $$props) $$invalidate(11, t2 = $$props.t2);
    		if ('size' in $$props) $$invalidate(12, size = $$props.size);
    		if ('sinister' in $$props) $$invalidate(13, sinister = $$props.sinister);
    		if ('reversed' in $$props) $$invalidate(14, reversed = $$props.reversed);
    		if ('division' in $$props) $$invalidate(2, division = $$props.division);
    		if ('itemSize' in $$props) $$invalidate(3, itemSize = $$props.itemSize);
    		if ('coas' in $$props) $$invalidate(6, coas = $$props.coas);
    		if ('query' in $$props) $$invalidate(5, query = $$props.query);
    		if ('queryOld' in $$props) queryOld = $$props.queryOld;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*category, t1, t2, size, sinister, reversed*/ 31745) {
    			update();
    		}

    		if ($$self.$$.dirty & /*query*/ 32) {
    			showResults(query);
    		}
    	};

    	return [
    		category,
    		charge,
    		division,
    		itemSize,
    		type,
    		query,
    		coas,
    		categories,
    		cap,
    		getTip,
    		t1,
    		t2,
    		size,
    		sinister,
    		reversed,
    		select_change_handler,
    		input_handler,
    		input_input_handler,
    		click_handler
    	];
    }

    class EditorCharge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			charge: 1,
    			type: 4,
    			category: 0,
    			t1: 10,
    			t2: 11,
    			size: 12,
    			sinister: 13,
    			reversed: 14,
    			division: 2,
    			itemSize: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorCharge",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*charge*/ ctx[1] === undefined && !('charge' in props)) {
    			console.warn("<EditorCharge> was created without expected prop 'charge'");
    		}

    		if (/*type*/ ctx[4] === undefined && !('type' in props)) {
    			console.warn("<EditorCharge> was created without expected prop 'type'");
    		}

    		if (/*category*/ ctx[0] === undefined && !('category' in props)) {
    			console.warn("<EditorCharge> was created without expected prop 'category'");
    		}

    		if (/*t1*/ ctx[10] === undefined && !('t1' in props)) {
    			console.warn("<EditorCharge> was created without expected prop 't1'");
    		}

    		if (/*t2*/ ctx[11] === undefined && !('t2' in props)) {
    			console.warn("<EditorCharge> was created without expected prop 't2'");
    		}

    		if (/*itemSize*/ ctx[3] === undefined && !('itemSize' in props)) {
    			console.warn("<EditorCharge> was created without expected prop 'itemSize'");
    		}
    	}

    	get charge() {
    		throw new Error("<EditorCharge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charge(value) {
    		throw new Error("<EditorCharge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<EditorCharge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<EditorCharge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get category() {
    		throw new Error("<EditorCharge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set category(value) {
    		throw new Error("<EditorCharge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t1() {
    		throw new Error("<EditorCharge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t1(value) {
    		throw new Error("<EditorCharge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t2() {
    		throw new Error("<EditorCharge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t2(value) {
    		throw new Error("<EditorCharge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<EditorCharge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<EditorCharge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sinister() {
    		throw new Error("<EditorCharge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sinister(value) {
    		throw new Error("<EditorCharge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reversed() {
    		throw new Error("<EditorCharge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reversed(value) {
    		throw new Error("<EditorCharge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get division() {
    		throw new Error("<EditorCharge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set division(value) {
    		throw new Error("<EditorCharge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemSize() {
    		throw new Error("<EditorCharge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemSize(value) {
    		throw new Error("<EditorCharge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorDivision.svelte generated by Svelte v3.44.2 */

    const { Object: Object_1$6 } = globals;
    const file$h = "src\\components\\editor\\EditorDivision.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (10:0) {#each coas as coa (coa)}
    function create_each_block$8(key_1, ctx) {
    	let div;
    	let editoritem;
    	let t_1;
    	let current;
    	let mounted;
    	let dispose;

    	editoritem = new EditorItem({
    			props: {
    				coa: /*coa*/ ctx[8],
    				tip: "Division: " + /*coa*/ ctx[8].d,
    				itemSize: /*itemSize*/ ctx[1]
    			},
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*coa*/ ctx[8]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(editoritem.$$.fragment);
    			t_1 = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*division*/ ctx[0] === /*coa*/ ctx[8].d);
    			add_location(div, file$h, 10, 2, 372);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editoritem, div, null);
    			append_dev(div, t_1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const editoritem_changes = {};
    			if (dirty & /*coas*/ 4) editoritem_changes.coa = /*coa*/ ctx[8];
    			if (dirty & /*coas*/ 4) editoritem_changes.tip = "Division: " + /*coa*/ ctx[8].d;
    			if (dirty & /*itemSize*/ 2) editoritem_changes.itemSize = /*itemSize*/ ctx[1];
    			editoritem.$set(editoritem_changes);

    			if (dirty & /*division, coas*/ 5) {
    				toggle_class(div, "selected", /*division*/ ctx[0] === /*coa*/ ctx[8].d);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editoritem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editoritem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editoritem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(10:0) {#each coas as coa (coa)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*coas*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*coa*/ ctx[8];
    	validate_each_keys(ctx, each_value, get_each_context$8, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$8(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$8(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*division, coas, itemSize*/ 7) {
    				each_value = /*coas*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$8, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$8, each_1_anchor, get_each_context$8);
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
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let coas;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorDivision', slots, []);
    	let { division, t1, t, line, itemSize } = $$props;
    	const divisionList = ["no"].concat(Object.keys(divisions.variants));
    	const writable_props = ['division', 't1', 't', 'line', 'itemSize'];

    	Object_1$6.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorDivision> was created with unknown prop '${key}'`);
    	});

    	const click_handler = coa => $$invalidate(0, division = coa.d);

    	$$self.$$set = $$props => {
    		if ('division' in $$props) $$invalidate(0, division = $$props.division);
    		if ('t1' in $$props) $$invalidate(3, t1 = $$props.t1);
    		if ('t' in $$props) $$invalidate(4, t = $$props.t);
    		if ('line' in $$props) $$invalidate(5, line = $$props.line);
    		if ('itemSize' in $$props) $$invalidate(1, itemSize = $$props.itemSize);
    	};

    	$$self.$capture_state = () => ({
    		EditorItem,
    		divisions,
    		division,
    		t1,
    		t,
    		line,
    		itemSize,
    		divisionList,
    		coas
    	});

    	$$self.$inject_state = $$props => {
    		if ('division' in $$props) $$invalidate(0, division = $$props.division);
    		if ('t1' in $$props) $$invalidate(3, t1 = $$props.t1);
    		if ('t' in $$props) $$invalidate(4, t = $$props.t);
    		if ('line' in $$props) $$invalidate(5, line = $$props.line);
    		if ('itemSize' in $$props) $$invalidate(1, itemSize = $$props.itemSize);
    		if ('coas' in $$props) $$invalidate(2, coas = $$props.coas);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*t1, t, line*/ 56) {
    			$$invalidate(2, coas = divisionList.map(division => new Object({
    					d: division,
    					t1,
    					division: { division, t, line }
    				})));
    		}
    	};

    	return [division, itemSize, coas, t1, t, line, click_handler];
    }

    class EditorDivision extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			division: 0,
    			t1: 3,
    			t: 4,
    			line: 5,
    			itemSize: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorDivision",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*division*/ ctx[0] === undefined && !('division' in props)) {
    			console.warn("<EditorDivision> was created without expected prop 'division'");
    		}

    		if (/*t1*/ ctx[3] === undefined && !('t1' in props)) {
    			console.warn("<EditorDivision> was created without expected prop 't1'");
    		}

    		if (/*t*/ ctx[4] === undefined && !('t' in props)) {
    			console.warn("<EditorDivision> was created without expected prop 't'");
    		}

    		if (/*line*/ ctx[5] === undefined && !('line' in props)) {
    			console.warn("<EditorDivision> was created without expected prop 'line'");
    		}

    		if (/*itemSize*/ ctx[1] === undefined && !('itemSize' in props)) {
    			console.warn("<EditorDivision> was created without expected prop 'itemSize'");
    		}
    	}

    	get division() {
    		throw new Error("<EditorDivision>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set division(value) {
    		throw new Error("<EditorDivision>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t1() {
    		throw new Error("<EditorDivision>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t1(value) {
    		throw new Error("<EditorDivision>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t() {
    		throw new Error("<EditorDivision>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t(value) {
    		throw new Error("<EditorDivision>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get line() {
    		throw new Error("<EditorDivision>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set line(value) {
    		throw new Error("<EditorDivision>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemSize() {
    		throw new Error("<EditorDivision>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemSize(value) {
    		throw new Error("<EditorDivision>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorDivided.svelte generated by Svelte v3.44.2 */

    const file$g = "src\\components\\editor\\EditorDivided.svelte";

    // (11:2) {#if !raster}
    function create_if_block$7(ctx) {
    	let option;

    	const block = {
    		c: function create() {
    			option = element("option");
    			option.textContent = "Сounterchanged";
    			option.__value = "counter";
    			option.value = option.__value;
    			add_location(option, file$g, 11, 4, 291);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(11:2) {#if !raster}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let span;
    	let t1;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let mounted;
    	let dispose;
    	let if_block = !/*raster*/ ctx[1] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Divided:";
    			t1 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "No (standard)";
    			option1 = element("option");
    			option1.textContent = "Crop by main field";
    			option2 = element("option");
    			option2.textContent = "Crop by division";
    			if (if_block) if_block.c();
    			add_location(span, file$g, 5, 0, 66);
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$g, 7, 2, 122);
    			option1.__value = "field";
    			option1.value = option1.__value;
    			add_location(option1, file$g, 8, 2, 165);
    			option2.__value = "division";
    			option2.value = option2.__value;
    			add_location(option2, file$g, 9, 2, 218);
    			if (/*divided*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$g, 6, 0, 89);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			if (if_block) if_block.m(select, null);
    			select_option(select, /*divided*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*raster*/ ctx[1]) {
    				if (if_block) ; else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(select, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*divided*/ 1) {
    				select_option(select, /*divided*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(select);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorDivided', slots, []);
    	let { divided, raster = null } = $$props;
    	const writable_props = ['divided', 'raster'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorDivided> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		divided = select_value(this);
    		$$invalidate(0, divided);
    	}

    	$$self.$$set = $$props => {
    		if ('divided' in $$props) $$invalidate(0, divided = $$props.divided);
    		if ('raster' in $$props) $$invalidate(1, raster = $$props.raster);
    	};

    	$$self.$capture_state = () => ({ divided, raster });

    	$$self.$inject_state = $$props => {
    		if ('divided' in $$props) $$invalidate(0, divided = $$props.divided);
    		if ('raster' in $$props) $$invalidate(1, raster = $$props.raster);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [divided, raster, select_change_handler];
    }

    class EditorDivided extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { divided: 0, raster: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorDivided",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*divided*/ ctx[0] === undefined && !('divided' in props)) {
    			console.warn("<EditorDivided> was created without expected prop 'divided'");
    		}
    	}

    	get divided() {
    		throw new Error("<EditorDivided>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set divided(value) {
    		throw new Error("<EditorDivided>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get raster() {
    		throw new Error("<EditorDivided>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set raster(value) {
    		throw new Error("<EditorDivided>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorLine.svelte generated by Svelte v3.44.2 */

    const { Object: Object_1$5 } = globals;
    const file$f = "src\\components\\editor\\EditorLine.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (19:0) {#each coas as coa (coa)}
    function create_each_block$7(key_1, ctx) {
    	let div;
    	let editoritem;
    	let t_1;
    	let current;
    	let mounted;
    	let dispose;

    	editoritem = new EditorItem({
    			props: {
    				coa: /*coa*/ ctx[10],
    				tip: /*getTip*/ ctx[3](/*coa*/ ctx[10].line),
    				itemSize: /*itemSize*/ ctx[1]
    			},
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*coa*/ ctx[10]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(editoritem.$$.fragment);
    			t_1 = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*line*/ ctx[0] === /*coa*/ ctx[10].line);
    			add_location(div, file$f, 19, 2, 574);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editoritem, div, null);
    			append_dev(div, t_1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const editoritem_changes = {};
    			if (dirty & /*coas*/ 4) editoritem_changes.coa = /*coa*/ ctx[10];
    			if (dirty & /*coas*/ 4) editoritem_changes.tip = /*getTip*/ ctx[3](/*coa*/ ctx[10].line);
    			if (dirty & /*itemSize*/ 2) editoritem_changes.itemSize = /*itemSize*/ ctx[1];
    			editoritem.$set(editoritem_changes);

    			if (dirty & /*line, coas*/ 5) {
    				toggle_class(div, "selected", /*line*/ ctx[0] === /*coa*/ ctx[10].line);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editoritem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editoritem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editoritem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(19:0) {#each coas as coa (coa)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let t1_1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*coas*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*coa*/ ctx[10];
    	validate_each_keys(ctx, each_value, get_each_context$7, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$7(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$7(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Line:";
    			t1_1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(div, file$f, 17, 0, 527);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t1_1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*line, coas, getTip, itemSize*/ 15) {
    				each_value = /*coas*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$7, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$7, each_1_anchor, get_each_context$7);
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
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let coas;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorLine', slots, []);
    	let { line, division = null, ordinary = null, t1, t, itemSize } = $$props;
    	const lineList = Object.keys(lines$1);
    	const getTip = l => division ? "Division line: " + l : "Ordinary line: " + l;
    	const writable_props = ['line', 'division', 'ordinary', 't1', 't', 'itemSize'];

    	Object_1$5.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorLine> was created with unknown prop '${key}'`);
    	});

    	const click_handler = coa => $$invalidate(0, line = coa.line);

    	$$self.$$set = $$props => {
    		if ('line' in $$props) $$invalidate(0, line = $$props.line);
    		if ('division' in $$props) $$invalidate(4, division = $$props.division);
    		if ('ordinary' in $$props) $$invalidate(5, ordinary = $$props.ordinary);
    		if ('t1' in $$props) $$invalidate(6, t1 = $$props.t1);
    		if ('t' in $$props) $$invalidate(7, t = $$props.t);
    		if ('itemSize' in $$props) $$invalidate(1, itemSize = $$props.itemSize);
    	};

    	$$self.$capture_state = () => ({
    		EditorItem,
    		lines: lines$1,
    		line,
    		division,
    		ordinary,
    		t1,
    		t,
    		itemSize,
    		lineList,
    		getTip,
    		coas
    	});

    	$$self.$inject_state = $$props => {
    		if ('line' in $$props) $$invalidate(0, line = $$props.line);
    		if ('division' in $$props) $$invalidate(4, division = $$props.division);
    		if ('ordinary' in $$props) $$invalidate(5, ordinary = $$props.ordinary);
    		if ('t1' in $$props) $$invalidate(6, t1 = $$props.t1);
    		if ('t' in $$props) $$invalidate(7, t = $$props.t);
    		if ('itemSize' in $$props) $$invalidate(1, itemSize = $$props.itemSize);
    		if ('coas' in $$props) $$invalidate(2, coas = $$props.coas);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*division, t1, t, ordinary*/ 240) {
    			$$invalidate(2, coas = division
    			? lineList.map(line => new Object({
    						line,
    						t1,
    						division: { division, t, line }
    					}))
    			: lineList.map(line => new Object({
    						line,
    						t1,
    						ordinaries: [{ ordinary, t, line }]
    					})));
    		}
    	};

    	return [line, itemSize, coas, getTip, division, ordinary, t1, t, click_handler];
    }

    class EditorLine extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			line: 0,
    			division: 4,
    			ordinary: 5,
    			t1: 6,
    			t: 7,
    			itemSize: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorLine",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*line*/ ctx[0] === undefined && !('line' in props)) {
    			console.warn("<EditorLine> was created without expected prop 'line'");
    		}

    		if (/*t1*/ ctx[6] === undefined && !('t1' in props)) {
    			console.warn("<EditorLine> was created without expected prop 't1'");
    		}

    		if (/*t*/ ctx[7] === undefined && !('t' in props)) {
    			console.warn("<EditorLine> was created without expected prop 't'");
    		}

    		if (/*itemSize*/ ctx[1] === undefined && !('itemSize' in props)) {
    			console.warn("<EditorLine> was created without expected prop 'itemSize'");
    		}
    	}

    	get line() {
    		throw new Error("<EditorLine>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set line(value) {
    		throw new Error("<EditorLine>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get division() {
    		throw new Error("<EditorLine>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set division(value) {
    		throw new Error("<EditorLine>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ordinary() {
    		throw new Error("<EditorLine>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ordinary(value) {
    		throw new Error("<EditorLine>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t1() {
    		throw new Error("<EditorLine>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t1(value) {
    		throw new Error("<EditorLine>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t() {
    		throw new Error("<EditorLine>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t(value) {
    		throw new Error("<EditorLine>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemSize() {
    		throw new Error("<EditorLine>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemSize(value) {
    		throw new Error("<EditorLine>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorOrdinary.svelte generated by Svelte v3.44.2 */

    const { Object: Object_1$4 } = globals;
    const file$e = "src\\components\\editor\\EditorOrdinary.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (10:0) {#each coas as coa (coa)}
    function create_each_block$6(key_1, ctx) {
    	let div;
    	let editoritem;
    	let t_1;
    	let current;
    	let mounted;
    	let dispose;

    	editoritem = new EditorItem({
    			props: {
    				coa: /*coa*/ ctx[8],
    				tip: "Ordinary: " + /*coa*/ ctx[8].ordinary,
    				itemSize: /*itemSize*/ ctx[1]
    			},
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*coa*/ ctx[8]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(editoritem.$$.fragment);
    			t_1 = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*ordinary*/ ctx[0] === /*coa*/ ctx[8].ordinary);
    			add_location(div, file$e, 10, 2, 402);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editoritem, div, null);
    			append_dev(div, t_1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const editoritem_changes = {};
    			if (dirty & /*coas*/ 4) editoritem_changes.coa = /*coa*/ ctx[8];
    			if (dirty & /*coas*/ 4) editoritem_changes.tip = "Ordinary: " + /*coa*/ ctx[8].ordinary;
    			if (dirty & /*itemSize*/ 2) editoritem_changes.itemSize = /*itemSize*/ ctx[1];
    			editoritem.$set(editoritem_changes);

    			if (dirty & /*ordinary, coas*/ 5) {
    				toggle_class(div, "selected", /*ordinary*/ ctx[0] === /*coa*/ ctx[8].ordinary);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editoritem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editoritem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editoritem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(10:0) {#each coas as coa (coa)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*coas*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*coa*/ ctx[8];
    	validate_each_keys(ctx, each_value, get_each_context$6, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$6(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ordinary, coas, itemSize*/ 7) {
    				each_value = /*coas*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$6, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$6, each_1_anchor, get_each_context$6);
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
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let coas;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorOrdinary', slots, []);
    	let { ordinary, line, t1, t, itemSize } = $$props;
    	const ordinariesList = Object.keys(ordinaries.lined).concat(Object.keys(ordinaries.straight));
    	const writable_props = ['ordinary', 'line', 't1', 't', 'itemSize'];

    	Object_1$4.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorOrdinary> was created with unknown prop '${key}'`);
    	});

    	const click_handler = coa => $$invalidate(0, ordinary = coa.ordinary);

    	$$self.$$set = $$props => {
    		if ('ordinary' in $$props) $$invalidate(0, ordinary = $$props.ordinary);
    		if ('line' in $$props) $$invalidate(3, line = $$props.line);
    		if ('t1' in $$props) $$invalidate(4, t1 = $$props.t1);
    		if ('t' in $$props) $$invalidate(5, t = $$props.t);
    		if ('itemSize' in $$props) $$invalidate(1, itemSize = $$props.itemSize);
    	};

    	$$self.$capture_state = () => ({
    		EditorItem,
    		ordinaries,
    		ordinary,
    		line,
    		t1,
    		t,
    		itemSize,
    		ordinariesList,
    		coas
    	});

    	$$self.$inject_state = $$props => {
    		if ('ordinary' in $$props) $$invalidate(0, ordinary = $$props.ordinary);
    		if ('line' in $$props) $$invalidate(3, line = $$props.line);
    		if ('t1' in $$props) $$invalidate(4, t1 = $$props.t1);
    		if ('t' in $$props) $$invalidate(5, t = $$props.t);
    		if ('itemSize' in $$props) $$invalidate(1, itemSize = $$props.itemSize);
    		if ('coas' in $$props) $$invalidate(2, coas = $$props.coas);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*t1, line, t*/ 56) {
    			$$invalidate(2, coas = ordinariesList.map(ordinary => new Object({
    					ordinary,
    					t1,
    					ordinaries: [{ ordinary, line, t }]
    				})));
    		}
    	};

    	return [ordinary, itemSize, coas, line, t1, t, click_handler];
    }

    class EditorOrdinary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			ordinary: 0,
    			line: 3,
    			t1: 4,
    			t: 5,
    			itemSize: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorOrdinary",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*ordinary*/ ctx[0] === undefined && !('ordinary' in props)) {
    			console.warn("<EditorOrdinary> was created without expected prop 'ordinary'");
    		}

    		if (/*line*/ ctx[3] === undefined && !('line' in props)) {
    			console.warn("<EditorOrdinary> was created without expected prop 'line'");
    		}

    		if (/*t1*/ ctx[4] === undefined && !('t1' in props)) {
    			console.warn("<EditorOrdinary> was created without expected prop 't1'");
    		}

    		if (/*t*/ ctx[5] === undefined && !('t' in props)) {
    			console.warn("<EditorOrdinary> was created without expected prop 't'");
    		}

    		if (/*itemSize*/ ctx[1] === undefined && !('itemSize' in props)) {
    			console.warn("<EditorOrdinary> was created without expected prop 'itemSize'");
    		}
    	}

    	get ordinary() {
    		throw new Error("<EditorOrdinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ordinary(value) {
    		throw new Error("<EditorOrdinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get line() {
    		throw new Error("<EditorOrdinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set line(value) {
    		throw new Error("<EditorOrdinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t1() {
    		throw new Error("<EditorOrdinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t1(value) {
    		throw new Error("<EditorOrdinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t() {
    		throw new Error("<EditorOrdinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t(value) {
    		throw new Error("<EditorOrdinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemSize() {
    		throw new Error("<EditorOrdinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemSize(value) {
    		throw new Error("<EditorOrdinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\Switch.svelte generated by Svelte v3.44.2 */

    const file$d = "src\\components\\editor\\Switch.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let input;
    	let t0;
    	let label;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text("Switch");
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			attr_dev(input, "class", "switch-input svelte-1cmzv6a");
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$d, 6, 2, 136);
    			attr_dev(label, "for", /*id*/ ctx[1]);
    			attr_dev(label, "class", "switch-label svelte-1cmzv6a");
    			add_location(label, file$d, 7, 2, 204);
    			attr_dev(div, "class", "switch svelte-1cmzv6a");
    			add_location(div, file$d, 5, 0, 112);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(div, t0);
    			append_dev(div, label);
    			append_dev(label, t1);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Switch', slots, []);
    	let { checked = false } = $$props;
    	const id = "switch" + Math.floor(1e6 * Math.random());
    	const writable_props = ['checked'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$props => {
    		if ('checked' in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => ({ checked, id });

    	$$self.$inject_state = $$props => {
    		if ('checked' in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked, id, input_change_handler];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { checked: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get checked() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorStroke.svelte generated by Svelte v3.44.2 */
    const file$c = "src\\components\\editor\\EditorStroke.svelte";

    // (10:2) {#if element.showStroke}
    function create_if_block$6(ctx) {
    	let span;
    	let t1;
    	let input;
    	let t2;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*element*/ ctx[0].ordinary && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Color:";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			set_style(span, "margin-left", "1em");
    			add_location(span, file$c, 10, 4, 321);
    			attr_dev(input, "type", "color");
    			attr_dev(input, "class", "svelte-ex5ti9");
    			add_location(input, file$c, 11, 4, 371);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*element*/ ctx[0].stroke);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*element*/ 1) {
    				set_input_value(input, /*element*/ ctx[0].stroke);
    			}

    			if (/*element*/ ctx[0].ordinary) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(10:2) {#if element.showStroke}",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#if element.ordinary}
    function create_if_block_1$4(ctx) {
    	let span;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Width:";
    			t1 = space();
    			input = element("input");
    			set_style(span, "margin-left", "1em");
    			add_location(span, file$c, 14, 6, 459);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", ".1");
    			attr_dev(input, "max", "5");
    			attr_dev(input, "step", ".1");
    			attr_dev(input, "class", "svelte-ex5ti9");
    			add_location(input, file$c, 15, 6, 511);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*element*/ ctx[0].strokeWidth);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*element*/ 1 && to_number(input.value) !== /*element*/ ctx[0].strokeWidth) {
    				set_input_value(input, /*element*/ ctx[0].strokeWidth);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(14:4) {#if element.ordinary}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let span1;
    	let span0;
    	let t1;
    	let switch_1;
    	let updating_checked;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;

    	function switch_1_checked_binding(value) {
    		/*switch_1_checked_binding*/ ctx[1](value);
    	}

    	let switch_1_props = {};

    	if (/*element*/ ctx[0].showStroke !== void 0) {
    		switch_1_props.checked = /*element*/ ctx[0].showStroke;
    	}

    	switch_1 = new Switch({ props: switch_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch_1, 'checked', switch_1_checked_binding));
    	let if_block = /*element*/ ctx[0].showStroke && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			span0 = element("span");
    			span0.textContent = "Stroke:";
    			t1 = space();
    			create_component(switch_1.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			add_location(span0, file$c, 7, 2, 219);
    			attr_dev(span1, "data-tooltip", "Element stroke. Check to render and select a color");
    			add_location(span1, file$c, 6, 0, 131);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, span0);
    			append_dev(span1, t1);
    			mount_component(switch_1, span1, null);
    			append_dev(span1, t2);
    			if (if_block) if_block.m(span1, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(tooltip.call(null, span1));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_1_changes = {};

    			if (!updating_checked && dirty & /*element*/ 1) {
    				updating_checked = true;
    				switch_1_changes.checked = /*element*/ ctx[0].showStroke;
    				add_flush_callback(() => updating_checked = false);
    			}

    			switch_1.$set(switch_1_changes);

    			if (/*element*/ ctx[0].showStroke) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(span1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			destroy_component(switch_1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorStroke', slots, []);
    	let { element } = $$props;
    	const writable_props = ['element'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorStroke> was created with unknown prop '${key}'`);
    	});

    	function switch_1_checked_binding(value) {
    		if ($$self.$$.not_equal(element.showStroke, value)) {
    			element.showStroke = value;
    			$$invalidate(0, element);
    		}
    	}

    	function input_input_handler() {
    		element.stroke = this.value;
    		$$invalidate(0, element);
    	}

    	function input_input_handler_1() {
    		element.strokeWidth = to_number(this.value);
    		$$invalidate(0, element);
    	}

    	$$self.$$set = $$props => {
    		if ('element' in $$props) $$invalidate(0, element = $$props.element);
    	};

    	$$self.$capture_state = () => ({ Switch, tooltip, element });

    	$$self.$inject_state = $$props => {
    		if ('element' in $$props) $$invalidate(0, element = $$props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [element, switch_1_checked_binding, input_input_handler, input_input_handler_1];
    }

    class EditorStroke extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { element: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorStroke",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*element*/ ctx[0] === undefined && !('element' in props)) {
    			console.warn("<EditorStroke> was created without expected prop 'element'");
    		}
    	}

    	get element() {
    		throw new Error("<EditorStroke>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<EditorStroke>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorPosition.svelte generated by Svelte v3.44.2 */
    const file$b = "src\\components\\editor\\EditorPosition.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (28:4) {#each positionsSelect as position}
    function create_each_block$5(ctx) {
    	let option;
    	let t_value = /*position*/ ctx[9] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*position*/ ctx[9];
    			option.value = option.__value;
    			add_location(option, file$b, 28, 6, 950);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(28:4) {#each positionsSelect as position}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let span0;
    	let t0;
    	let input;
    	let t1;
    	let select;
    	let t2;
    	let span2;
    	let span1;
    	let t4;
    	let switch0;
    	let updating_checked;
    	let t5;
    	let span4;
    	let span3;
    	let t7;
    	let switch1;
    	let updating_checked_1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = positionsSelect;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	function switch0_checked_binding(value) {
    		/*switch0_checked_binding*/ ctx[6](value);
    	}

    	let switch0_props = {};

    	if (/*charge*/ ctx[0].sinister !== void 0) {
    		switch0_props.checked = /*charge*/ ctx[0].sinister;
    	}

    	switch0 = new Switch({ props: switch0_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch0, 'checked', switch0_checked_binding));

    	function switch1_checked_binding(value) {
    		/*switch1_checked_binding*/ ctx[7](value);
    	}

    	let switch1_props = {};

    	if (/*charge*/ ctx[0].reversed !== void 0) {
    		switch1_props.checked = /*charge*/ ctx[0].reversed;
    	}

    	switch1 = new Switch({ props: switch1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch1, 'checked', switch1_checked_binding));

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			t0 = text("Positions:\r\n  ");
    			input = element("input");
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			span2 = element("span");
    			span1 = element("span");
    			span1.textContent = "Sinister:";
    			t4 = space();
    			create_component(switch0.$$.fragment);
    			t5 = space();
    			span4 = element("span");
    			span3 = element("span");
    			span3.textContent = "Reversed:";
    			t7 = space();
    			create_component(switch1.$$.fragment);
    			attr_dev(input, "class", "svelte-gqtmdl");
    			add_location(input, file$b, 25, 2, 686);
    			attr_dev(select, "class", "svelte-gqtmdl");
    			if (/*charge*/ ctx[0].p === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$b, 26, 2, 795);
    			attr_dev(span0, "data-tooltip", "Points on shield to place a charge");
    			add_location(span0, file$b, 23, 0, 600);
    			set_style(span1, "margin-left", "1em");
    			attr_dev(span1, "class", "svelte-gqtmdl");
    			add_location(span1, file$b, 34, 2, 1094);
    			attr_dev(span2, "data-tooltip", "Turn charge to the left");
    			attr_dev(span2, "class", "svelte-gqtmdl");
    			add_location(span2, file$b, 33, 0, 1033);
    			set_style(span3, "margin-left", "1em");
    			attr_dev(span3, "class", "svelte-gqtmdl");
    			add_location(span3, file$b, 39, 2, 1260);
    			attr_dev(span4, "data-tooltip", "Show charge upside down");
    			attr_dev(span4, "class", "svelte-gqtmdl");
    			add_location(span4, file$b, 38, 0, 1199);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			append_dev(span0, t0);
    			append_dev(span0, input);
    			set_input_value(input, /*charge*/ ctx[0].p);
    			append_dev(span0, t1);
    			append_dev(span0, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*charge*/ ctx[0].p);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span2, anchor);
    			append_dev(span2, span1);
    			append_dev(span2, t4);
    			mount_component(switch0, span2, null);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, span4, anchor);
    			append_dev(span4, span3);
    			append_dev(span4, t7);
    			mount_component(switch1, span4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(input, "input", /*showPositions*/ ctx[1], false, false, false),
    					listen_dev(input, "focus", /*showPositions*/ ctx[1], false, false, false),
    					listen_dev(input, "blur", /*hidePositions*/ ctx[2], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[5]),
    					listen_dev(select, "change", /*changePosition*/ ctx[3], false, false, false),
    					listen_dev(select, "focus", /*showPositions*/ ctx[1], false, false, false),
    					listen_dev(select, "blur", /*hidePositions*/ ctx[2], false, false, false),
    					action_destroyer(tooltip.call(null, span0)),
    					action_destroyer(tooltip.call(null, span2)),
    					action_destroyer(tooltip.call(null, span4))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*charge, positionsSelect*/ 1 && input.value !== /*charge*/ ctx[0].p) {
    				set_input_value(input, /*charge*/ ctx[0].p);
    			}

    			if (dirty & /*positionsSelect*/ 0) {
    				each_value = positionsSelect;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*charge, positionsSelect*/ 1) {
    				select_option(select, /*charge*/ ctx[0].p);
    			}

    			const switch0_changes = {};

    			if (!updating_checked && dirty & /*charge*/ 1) {
    				updating_checked = true;
    				switch0_changes.checked = /*charge*/ ctx[0].sinister;
    				add_flush_callback(() => updating_checked = false);
    			}

    			switch0.$set(switch0_changes);
    			const switch1_changes = {};

    			if (!updating_checked_1 && dirty & /*charge*/ 1) {
    				updating_checked_1 = true;
    				switch1_changes.checked = /*charge*/ ctx[0].reversed;
    				add_flush_callback(() => updating_checked_1 = false);
    			}

    			switch1.$set(switch1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch0.$$.fragment, local);
    			transition_in(switch1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch0.$$.fragment, local);
    			transition_out(switch1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span2);
    			destroy_component(switch0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(span4);
    			destroy_component(switch1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $state;
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(8, $state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorPosition', slots, []);
    	let { charge } = $$props;

    	function showPositions() {
    		set_store_value(state, $state.transform = `rotate(${charge.angle || 0}) translate(${charge.x || 0}, ${charge.y || 0})`, $state);
    		set_store_value(state, $state.positions = charge.p, $state);
    	}

    	function hidePositions() {
    		set_store_value(state, $state.positions = 0, $state);
    	}

    	function changePosition() {
    		showPositions();
    		$$invalidate(0, charge.size = getSize(charge.p), charge);
    	}

    	const writable_props = ['charge'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorPosition> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		charge.p = this.value;
    		$$invalidate(0, charge);
    	}

    	function select_change_handler() {
    		charge.p = select_value(this);
    		$$invalidate(0, charge);
    	}

    	function switch0_checked_binding(value) {
    		if ($$self.$$.not_equal(charge.sinister, value)) {
    			charge.sinister = value;
    			$$invalidate(0, charge);
    		}
    	}

    	function switch1_checked_binding(value) {
    		if ($$self.$$.not_equal(charge.reversed, value)) {
    			charge.reversed = value;
    			$$invalidate(0, charge);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('charge' in $$props) $$invalidate(0, charge = $$props.charge);
    	};

    	$$self.$capture_state = () => ({
    		Switch,
    		state,
    		positionsSelect,
    		getSize,
    		tooltip,
    		charge,
    		showPositions,
    		hidePositions,
    		changePosition,
    		$state
    	});

    	$$self.$inject_state = $$props => {
    		if ('charge' in $$props) $$invalidate(0, charge = $$props.charge);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		charge,
    		showPositions,
    		hidePositions,
    		changePosition,
    		input_input_handler,
    		select_change_handler,
    		switch0_checked_binding,
    		switch1_checked_binding
    	];
    }

    class EditorPosition extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { charge: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorPosition",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*charge*/ ctx[0] === undefined && !('charge' in props)) {
    			console.warn("<EditorPosition> was created without expected prop 'charge'");
    		}
    	}

    	get charge() {
    		throw new Error("<EditorPosition>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charge(value) {
    		throw new Error("<EditorPosition>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorShift.svelte generated by Svelte v3.44.2 */
    const file$a = "src\\components\\editor\\EditorShift.svelte";

    function create_fragment$a(ctx) {
    	let span0;
    	let t0;
    	let input0;
    	let input0_value_value;
    	let t1;
    	let span2;
    	let span1;
    	let t3;
    	let input1;
    	let t4;
    	let span4;
    	let span3;
    	let t6;
    	let input2;
    	let t7;
    	let input3;
    	let t8;
    	let span6;
    	let span5;
    	let t10;
    	let input4;
    	let t11;
    	let switch_1;
    	let updating_checked;
    	let current;
    	let mounted;
    	let dispose;

    	function switch_1_checked_binding(value) {
    		/*switch_1_checked_binding*/ ctx[9](value);
    	}

    	let switch_1_props = {};

    	if (/*$showGrid*/ ctx[2] !== void 0) {
    		switch_1_props.checked = /*$showGrid*/ ctx[2];
    	}

    	switch_1 = new Switch({ props: switch_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch_1, 'checked', switch_1_checked_binding));

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			t0 = text("Size:\r\n  ");
    			input0 = element("input");
    			t1 = space();
    			span2 = element("span");
    			span1 = element("span");
    			span1.textContent = "Rotation:";
    			t3 = space();
    			input1 = element("input");
    			t4 = space();
    			span4 = element("span");
    			span3 = element("span");
    			span3.textContent = "Shift:";
    			t6 = space();
    			input2 = element("input");
    			t7 = space();
    			input3 = element("input");
    			t8 = space();
    			span6 = element("span");
    			span5 = element("span");
    			span5.textContent = "Step:";
    			t10 = space();
    			input4 = element("input");
    			t11 = space();
    			create_component(switch_1.$$.fragment);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "min", "1");
    			attr_dev(input0, "max", "500");
    			attr_dev(input0, "step", "1");
    			input0.value = input0_value_value = /*e*/ ctx[0].size * 100 | 0;
    			attr_dev(input0, "class", "svelte-wggx8m");
    			add_location(input0, file$a, 13, 2, 335);
    			attr_dev(span0, "data-tooltip", "Element size in percents");
    			add_location(span0, file$a, 11, 0, 264);
    			attr_dev(span1, "class", "svelte-wggx8m");
    			add_location(span1, file$a, 26, 2, 595);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "-180");
    			attr_dev(input1, "max", "180");
    			attr_dev(input1, "class", "svelte-wggx8m");
    			add_location(input1, file$a, 27, 2, 621);
    			attr_dev(span2, "data-tooltip", "Element rotation angle in degrees");
    			attr_dev(span2, "class", "svelte-wggx8m");
    			add_location(span2, file$a, 25, 0, 524);
    			attr_dev(span3, "class", "svelte-wggx8m");
    			add_location(span3, file$a, 31, 2, 783);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "-100");
    			attr_dev(input2, "max", "100");
    			attr_dev(input2, "step", /*$grid*/ ctx[1]);
    			attr_dev(input2, "class", "svelte-wggx8m");
    			add_location(input2, file$a, 32, 2, 806);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "min", "-100");
    			attr_dev(input3, "max", "100");
    			attr_dev(input3, "step", /*$grid*/ ctx[1]);
    			attr_dev(input3, "class", "svelte-wggx8m");
    			add_location(input3, file$a, 33, 2, 884);
    			attr_dev(span4, "data-tooltip", "Element shift in pixels");
    			attr_dev(span4, "class", "svelte-wggx8m");
    			add_location(span4, file$a, 30, 0, 722);
    			attr_dev(span5, "class", "svelte-wggx8m");
    			add_location(span5, file$a, 37, 2, 1080);
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "min", "1");
    			attr_dev(input4, "max", "50");
    			attr_dev(input4, "class", "svelte-wggx8m");
    			add_location(input4, file$a, 38, 2, 1102);
    			attr_dev(span6, "data-tooltip", "Define grid size, angle and position shift step (in pixels and degrees)");
    			attr_dev(span6, "class", "svelte-wggx8m");
    			add_location(span6, file$a, 36, 0, 971);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			append_dev(span0, t0);
    			append_dev(span0, input0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span2, anchor);
    			append_dev(span2, span1);
    			append_dev(span2, t3);
    			append_dev(span2, input1);
    			set_input_value(input1, /*e*/ ctx[0].angle);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, span4, anchor);
    			append_dev(span4, span3);
    			append_dev(span4, t6);
    			append_dev(span4, input2);
    			set_input_value(input2, /*e*/ ctx[0].x);
    			append_dev(span4, t7);
    			append_dev(span4, input3);
    			set_input_value(input3, /*e*/ ctx[0].y);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, span6, anchor);
    			append_dev(span6, span5);
    			append_dev(span6, t10);
    			append_dev(span6, input4);
    			set_input_value(input4, /*$grid*/ ctx[1]);
    			append_dev(span6, t11);
    			mount_component(switch_1, span6, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input_handler*/ ctx[4], false, false, false),
    					action_destroyer(tooltip.call(null, span0)),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(input1, "change", /*updateGrid*/ ctx[3], false, false, false),
    					action_destroyer(tooltip.call(null, span2)),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[6]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[7]),
    					action_destroyer(tooltip.call(null, span4)),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[8]),
    					action_destroyer(tooltip.call(null, span6))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*e*/ 1 && input0_value_value !== (input0_value_value = /*e*/ ctx[0].size * 100 | 0)) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (dirty & /*e*/ 1 && to_number(input1.value) !== /*e*/ ctx[0].angle) {
    				set_input_value(input1, /*e*/ ctx[0].angle);
    			}

    			if (!current || dirty & /*$grid*/ 2) {
    				attr_dev(input2, "step", /*$grid*/ ctx[1]);
    			}

    			if (dirty & /*e*/ 1 && to_number(input2.value) !== /*e*/ ctx[0].x) {
    				set_input_value(input2, /*e*/ ctx[0].x);
    			}

    			if (!current || dirty & /*$grid*/ 2) {
    				attr_dev(input3, "step", /*$grid*/ ctx[1]);
    			}

    			if (dirty & /*e*/ 1 && to_number(input3.value) !== /*e*/ ctx[0].y) {
    				set_input_value(input3, /*e*/ ctx[0].y);
    			}

    			if (dirty & /*$grid*/ 2 && to_number(input4.value) !== /*$grid*/ ctx[1]) {
    				set_input_value(input4, /*$grid*/ ctx[1]);
    			}

    			const switch_1_changes = {};

    			if (!updating_checked && dirty & /*$showGrid*/ 4) {
    				updating_checked = true;
    				switch_1_changes.checked = /*$showGrid*/ ctx[2];
    				add_flush_callback(() => updating_checked = false);
    			}

    			switch_1.$set(switch_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(span4);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(span6);
    			destroy_component(switch_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $state;
    	let $grid;
    	let $showGrid;
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(10, $state = $$value));
    	validate_store(grid, 'grid');
    	component_subscribe($$self, grid, $$value => $$invalidate(1, $grid = $$value));
    	validate_store(showGrid, 'showGrid');
    	component_subscribe($$self, showGrid, $$value => $$invalidate(2, $showGrid = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorShift', slots, []);
    	let { e } = $$props;

    	function updateGrid() {
    		set_store_value(state, $state.transform = `rotate(${e.angle || 0})`, $state);
    	}

    	const writable_props = ['e'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorShift> was created with unknown prop '${key}'`);
    	});

    	const input_handler = function () {
    		$$invalidate(0, e.size = this.value / 100, e);
    	};

    	function input1_input_handler() {
    		e.angle = to_number(this.value);
    		$$invalidate(0, e);
    	}

    	function input2_input_handler() {
    		e.x = to_number(this.value);
    		$$invalidate(0, e);
    	}

    	function input3_input_handler() {
    		e.y = to_number(this.value);
    		$$invalidate(0, e);
    	}

    	function input4_input_handler() {
    		$grid = to_number(this.value);
    		grid.set($grid);
    	}

    	function switch_1_checked_binding(value) {
    		$showGrid = value;
    		showGrid.set($showGrid);
    	}

    	$$self.$$set = $$props => {
    		if ('e' in $$props) $$invalidate(0, e = $$props.e);
    	};

    	$$self.$capture_state = () => ({
    		Switch,
    		grid,
    		showGrid,
    		state,
    		tooltip,
    		e,
    		updateGrid,
    		$state,
    		$grid,
    		$showGrid
    	});

    	$$self.$inject_state = $$props => {
    		if ('e' in $$props) $$invalidate(0, e = $$props.e);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		e,
    		$grid,
    		$showGrid,
    		updateGrid,
    		input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		switch_1_checked_binding
    	];
    }

    class EditorShift extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { e: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorShift",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*e*/ ctx[0] === undefined && !('e' in props)) {
    			console.warn("<EditorShift> was created without expected prop 'e'");
    		}
    	}

    	get e() {
    		throw new Error("<EditorShift>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set e(value) {
    		throw new Error("<EditorShift>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorControls.svelte generated by Svelte v3.44.2 */
    const file$9 = "src\\components\\editor\\EditorControls.svelte";

    // (25:2) {#if els.length > 1}
    function create_if_block$5(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*i*/ ctx[1] && create_if_block_2$3(ctx);
    	let if_block1 = /*i*/ ctx[1] + 1 < /*els*/ ctx[0].length && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*i*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$3(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*i*/ ctx[1] + 1 < /*els*/ ctx[0].length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(25:2) {#if els.length > 1}",
    		ctx
    	});

    	return block;
    }

    // (26:4) {#if i}
    function create_if_block_2$3(ctx) {
    	let svg;
    	let use;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			use = svg_element("use");
    			attr_dev(use, "href", "#up-icon");
    			add_location(use, file$9, 27, 8, 776);
    			attr_dev(svg, "data-tooltip", "Send backward");
    			attr_dev(svg, "class", "svelte-oe21yt");
    			add_location(svg, file$9, 26, 6, 700);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, use);

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*backward*/ ctx[5], false, false, false),
    					action_destroyer(tooltip.call(null, svg))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(26:4) {#if i}",
    		ctx
    	});

    	return block;
    }

    // (31:4) {#if i + 1 < els.length}
    function create_if_block_1$3(ctx) {
    	let svg;
    	let use;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			use = svg_element("use");
    			attr_dev(use, "href", "#down-icon");
    			add_location(use, file$9, 32, 8, 937);
    			attr_dev(svg, "data-tooltip", "Bring forward");
    			attr_dev(svg, "class", "svelte-oe21yt");
    			add_location(svg, file$9, 31, 6, 862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, use);

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*forward*/ ctx[4], false, false, false),
    					action_destroyer(tooltip.call(null, svg))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(31:4) {#if i + 1 < els.length}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let span;
    	let svg0;
    	let use0;
    	let t0;
    	let t1;
    	let svg1;
    	let use1;
    	let mounted;
    	let dispose;
    	let if_block = /*els*/ ctx[0].length > 1 && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			svg0 = svg_element("svg");
    			use0 = svg_element("use");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			svg1 = svg_element("svg");
    			use1 = svg_element("use");
    			attr_dev(use0, "href", "#clone-icon");
    			add_location(use0, file$9, 22, 4, 619);
    			attr_dev(svg0, "data-tooltip", "Clone");
    			attr_dev(svg0, "class", "svelte-oe21yt");
    			add_location(svg0, file$9, 21, 2, 558);
    			attr_dev(use1, "href", "#remove-icon");
    			add_location(use1, file$9, 37, 4, 1063);
    			attr_dev(svg1, "data-tooltip", "Remove");
    			attr_dev(svg1, "class", "svelte-oe21yt");
    			add_location(svg1, file$9, 36, 2, 1000);
    			add_location(span, file$9, 20, 0, 548);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, svg0);
    			append_dev(svg0, use0);
    			append_dev(span, t0);
    			if (if_block) if_block.m(span, null);
    			append_dev(span, t1);
    			append_dev(span, svg1);
    			append_dev(svg1, use1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg0, "click", /*clone*/ ctx[3], false, false, false),
    					action_destroyer(tooltip.call(null, svg0)),
    					listen_dev(svg1, "click", /*remove*/ ctx[2], false, false, false),
    					action_destroyer(tooltip.call(null, svg1))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*els*/ ctx[0].length > 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(span, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorControls', slots, []);
    	let { els, el, i } = $$props;

    	const remove = event => {
    		event.stopPropagation();
    		$$invalidate(0, els = els.filter((e, n) => n !== i));
    	};

    	const clone = event => {
    		event.stopPropagation();
    		$$invalidate(0, els = [...els, JSON.parse(JSON.stringify(el))]);
    	};

    	const forward = event => {
    		event.stopPropagation();
    		$$invalidate(0, [els[i], els[i + 1]] = [els[i + 1], els[i]], els);
    	};

    	const backward = event => {
    		event.stopPropagation();
    		$$invalidate(0, [els[i], els[i - 1]] = [els[i - 1], els[i]], els);
    	};

    	const writable_props = ['els', 'el', 'i'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorControls> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('els' in $$props) $$invalidate(0, els = $$props.els);
    		if ('el' in $$props) $$invalidate(6, el = $$props.el);
    		if ('i' in $$props) $$invalidate(1, i = $$props.i);
    	};

    	$$self.$capture_state = () => ({
    		tooltip,
    		els,
    		el,
    		i,
    		remove,
    		clone,
    		forward,
    		backward
    	});

    	$$self.$inject_state = $$props => {
    		if ('els' in $$props) $$invalidate(0, els = $$props.els);
    		if ('el' in $$props) $$invalidate(6, el = $$props.el);
    		if ('i' in $$props) $$invalidate(1, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [els, i, remove, clone, forward, backward, el];
    }

    class EditorControls extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { els: 0, el: 6, i: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorControls",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*els*/ ctx[0] === undefined && !('els' in props)) {
    			console.warn("<EditorControls> was created without expected prop 'els'");
    		}

    		if (/*el*/ ctx[6] === undefined && !('el' in props)) {
    			console.warn("<EditorControls> was created without expected prop 'el'");
    		}

    		if (/*i*/ ctx[1] === undefined && !('i' in props)) {
    			console.warn("<EditorControls> was created without expected prop 'i'");
    		}
    	}

    	get els() {
    		throw new Error("<EditorControls>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set els(value) {
    		throw new Error("<EditorControls>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get el() {
    		throw new Error("<EditorControls>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set el(value) {
    		throw new Error("<EditorControls>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get i() {
    		throw new Error("<EditorControls>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set i(value) {
    		throw new Error("<EditorControls>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\EditorAbove.svelte generated by Svelte v3.44.2 */
    const file$8 = "src\\components\\editor\\EditorAbove.svelte";

    function create_fragment$8(ctx) {
    	let span1;
    	let span0;
    	let t1;
    	let switch_1;
    	let updating_checked;
    	let current;
    	let mounted;
    	let dispose;

    	function switch_1_checked_binding(value) {
    		/*switch_1_checked_binding*/ ctx[1](value);
    	}

    	let switch_1_props = {};

    	if (/*above*/ ctx[0] !== void 0) {
    		switch_1_props.checked = /*above*/ ctx[0];
    	}

    	switch_1 = new Switch({ props: switch_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch_1, 'checked', switch_1_checked_binding));

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			span0 = element("span");
    			span0.textContent = "Above charges:";
    			t1 = space();
    			create_component(switch_1.$$.fragment);
    			set_style(span0, "margin-left", "1em");
    			add_location(span0, file$8, 6, 2, 209);
    			attr_dev(span1, "data-tooltip", "Check to render ordinary above charges");
    			add_location(span1, file$8, 5, 0, 133);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, span0);
    			append_dev(span1, t1);
    			mount_component(switch_1, span1, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(tooltip.call(null, span1));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_1_changes = {};

    			if (!updating_checked && dirty & /*above*/ 1) {
    				updating_checked = true;
    				switch_1_changes.checked = /*above*/ ctx[0];
    				add_flush_callback(() => updating_checked = false);
    			}

    			switch_1.$set(switch_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			destroy_component(switch_1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditorAbove', slots, []);
    	let { above } = $$props;
    	const writable_props = ['above'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditorAbove> was created with unknown prop '${key}'`);
    	});

    	function switch_1_checked_binding(value) {
    		above = value;
    		$$invalidate(0, above);
    	}

    	$$self.$$set = $$props => {
    		if ('above' in $$props) $$invalidate(0, above = $$props.above);
    	};

    	$$self.$capture_state = () => ({ Switch, tooltip, above });

    	$$self.$inject_state = $$props => {
    		if ('above' in $$props) $$invalidate(0, above = $$props.above);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [above, switch_1_checked_binding];
    }

    class EditorAbove extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { above: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorAbove",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*above*/ ctx[0] === undefined && !('above' in props)) {
    			console.warn("<EditorAbove> was created without expected prop 'above'");
    		}
    	}

    	get above() {
    		throw new Error("<EditorAbove>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set above(value) {
    		throw new Error("<EditorAbove>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\editor\Editor.svelte generated by Svelte v3.44.2 */

    const { Boolean: Boolean_1, Object: Object_1$3 } = globals;
    const file$7 = "src\\components\\editor\\Editor.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[60] = list[i];
    	child_ctx[61] = list;
    	child_ctx[62] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[63] = list[i];
    	child_ctx[64] = list;
    	child_ctx[62] = i;
    	return child_ctx;
    }

    // (311:2) {#key coa}
    function create_key_block$1(ctx) {
    	let coa_1;
    	let current;

    	coa_1 = new COA({
    			props: {
    				coa: /*coa*/ ctx[1],
    				i: "Edit",
    				w: /*coaSize*/ ctx[5],
    				h: /*coaSize*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(coa_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(coa_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const coa_1_changes = {};
    			if (dirty[0] & /*coa*/ 2) coa_1_changes.coa = /*coa*/ ctx[1];
    			coa_1.$set(coa_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(coa_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(coa_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(coa_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block$1.name,
    		type: "key",
    		source: "(311:2) {#key coa}",
    		ctx
    	});

    	return block;
    }

    // (317:4) {#if section.field}
    function create_if_block_16(ctx) {
    	let div2;
    	let div0;
    	let editortype;
    	let updating_type;
    	let t0;
    	let t1;
    	let div1;
    	let editortincture;
    	let updating_t1;
    	let t2;
    	let t3;
    	let t4;
    	let div2_transition;
    	let current;

    	function editortype_type_binding(value) {
    		/*editortype_type_binding*/ ctx[14](value);
    	}

    	let editortype_props = {};

    	if (/*menu*/ ctx[0].field.type !== void 0) {
    		editortype_props.type = /*menu*/ ctx[0].field.type;
    	}

    	editortype = new EditorType({ props: editortype_props, $$inline: true });
    	binding_callbacks.push(() => bind(editortype, 'type', editortype_type_binding));
    	let if_block0 = /*menu*/ ctx[0].field.type !== "tincture" && create_if_block_20(ctx);

    	function editortincture_t1_binding(value) {
    		/*editortincture_t1_binding*/ ctx[16](value);
    	}

    	let editortincture_props = { itemSize: /*itemSize*/ ctx[4] };

    	if (/*menu*/ ctx[0].field.t1 !== void 0) {
    		editortincture_props.t1 = /*menu*/ ctx[0].field.t1;
    	}

    	editortincture = new EditorTincture({
    			props: editortincture_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editortincture, 't1', editortincture_t1_binding));
    	let if_block1 = /*menu*/ ctx[0].field.type !== "tincture" && create_if_block_19(ctx);
    	let if_block2 = /*menu*/ ctx[0].field.type === "pattern" && create_if_block_18(ctx);
    	let if_block3 = /*menu*/ ctx[0].field.type === "semy" && create_if_block_17(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(editortype.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div1 = element("div");
    			create_component(editortincture.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(div0, "class", "subsection svelte-12hcq6k");
    			add_location(div0, file$7, 318, 8, 11440);
    			attr_dev(div1, "class", "subsection svelte-12hcq6k");
    			add_location(div1, file$7, 325, 8, 11667);
    			attr_dev(div2, "class", "panel svelte-12hcq6k");
    			add_location(div2, file$7, 317, 6, 11394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(editortype, div0, null);
    			append_dev(div0, t0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(editortincture, div1, null);
    			append_dev(div2, t2);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t3);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t4);
    			if (if_block3) if_block3.m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editortype_changes = {};

    			if (!updating_type && dirty[0] & /*menu*/ 1) {
    				updating_type = true;
    				editortype_changes.type = /*menu*/ ctx[0].field.type;
    				add_flush_callback(() => updating_type = false);
    			}

    			editortype.$set(editortype_changes);

    			if (/*menu*/ ctx[0].field.type !== "tincture") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_20(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const editortincture_changes = {};
    			if (dirty[0] & /*itemSize*/ 16) editortincture_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_t1 && dirty[0] & /*menu*/ 1) {
    				updating_t1 = true;
    				editortincture_changes.t1 = /*menu*/ ctx[0].field.t1;
    				add_flush_callback(() => updating_t1 = false);
    			}

    			editortincture.$set(editortincture_changes);

    			if (/*menu*/ ctx[0].field.type !== "tincture") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_19(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div2, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*menu*/ ctx[0].field.type === "pattern") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_18(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div2, t4);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*menu*/ ctx[0].field.type === "semy") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 1) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_17(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div2, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editortype.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(editortincture.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editortype.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(editortincture.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(editortype);
    			if (if_block0) if_block0.d();
    			destroy_component(editortincture);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (detaching && div2_transition) div2_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(317:4) {#if section.field}",
    		ctx
    	});

    	return block;
    }

    // (321:10) {#if menu.field.type !== "tincture"}
    function create_if_block_20(ctx) {
    	let editorsize;
    	let updating_size;
    	let current;

    	function editorsize_size_binding(value) {
    		/*editorsize_size_binding*/ ctx[15](value);
    	}

    	let editorsize_props = {};

    	if (/*menu*/ ctx[0].field.size !== void 0) {
    		editorsize_props.size = /*menu*/ ctx[0].field.size;
    	}

    	editorsize = new EditorSize({ props: editorsize_props, $$inline: true });
    	binding_callbacks.push(() => bind(editorsize, 'size', editorsize_size_binding));

    	const block = {
    		c: function create() {
    			create_component(editorsize.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(editorsize, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editorsize_changes = {};

    			if (!updating_size && dirty[0] & /*menu*/ 1) {
    				updating_size = true;
    				editorsize_changes.size = /*menu*/ ctx[0].field.size;
    				add_flush_callback(() => updating_size = false);
    			}

    			editorsize.$set(editorsize_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editorsize.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editorsize.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(editorsize, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(321:10) {#if menu.field.type !== \\\"tincture\\\"}",
    		ctx
    	});

    	return block;
    }

    // (330:8) {#if menu.field.type !== "tincture"}
    function create_if_block_19(ctx) {
    	let div;
    	let editortincture;
    	let updating_t1;
    	let current;

    	function editortincture_t1_binding_1(value) {
    		/*editortincture_t1_binding_1*/ ctx[17](value);
    	}

    	let editortincture_props = { itemSize: /*itemSize*/ ctx[4] };

    	if (/*menu*/ ctx[0].field.t2 !== void 0) {
    		editortincture_props.t1 = /*menu*/ ctx[0].field.t2;
    	}

    	editortincture = new EditorTincture({
    			props: editortincture_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editortincture, 't1', editortincture_t1_binding_1));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editortincture.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-12hcq6k");
    			add_location(div, file$7, 330, 10, 11832);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editortincture, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editortincture_changes = {};
    			if (dirty[0] & /*itemSize*/ 16) editortincture_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_t1 && dirty[0] & /*menu*/ 1) {
    				updating_t1 = true;
    				editortincture_changes.t1 = /*menu*/ ctx[0].field.t2;
    				add_flush_callback(() => updating_t1 = false);
    			}

    			editortincture.$set(editortincture_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editortincture.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editortincture.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editortincture);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(330:8) {#if menu.field.type !== \\\"tincture\\\"}",
    		ctx
    	});

    	return block;
    }

    // (336:8) {#if menu.field.type === "pattern"}
    function create_if_block_18(ctx) {
    	let div;
    	let editorpattern;
    	let updating_pattern;
    	let current;

    	function editorpattern_pattern_binding(value) {
    		/*editorpattern_pattern_binding*/ ctx[18](value);
    	}

    	let editorpattern_props = {
    		t1: /*menu*/ ctx[0].field.t1,
    		t2: /*menu*/ ctx[0].field.t2,
    		size: /*menu*/ ctx[0].field.size,
    		itemSize: /*itemSize*/ ctx[4]
    	};

    	if (/*menu*/ ctx[0].field.pattern !== void 0) {
    		editorpattern_props.pattern = /*menu*/ ctx[0].field.pattern;
    	}

    	editorpattern = new EditorPattern({
    			props: editorpattern_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editorpattern, 'pattern', editorpattern_pattern_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editorpattern.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-12hcq6k");
    			add_location(div, file$7, 336, 10, 12015);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editorpattern, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editorpattern_changes = {};
    			if (dirty[0] & /*menu*/ 1) editorpattern_changes.t1 = /*menu*/ ctx[0].field.t1;
    			if (dirty[0] & /*menu*/ 1) editorpattern_changes.t2 = /*menu*/ ctx[0].field.t2;
    			if (dirty[0] & /*menu*/ 1) editorpattern_changes.size = /*menu*/ ctx[0].field.size;
    			if (dirty[0] & /*itemSize*/ 16) editorpattern_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_pattern && dirty[0] & /*menu*/ 1) {
    				updating_pattern = true;
    				editorpattern_changes.pattern = /*menu*/ ctx[0].field.pattern;
    				add_flush_callback(() => updating_pattern = false);
    			}

    			editorpattern.$set(editorpattern_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editorpattern.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editorpattern.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editorpattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(336:8) {#if menu.field.type === \\\"pattern\\\"}",
    		ctx
    	});

    	return block;
    }

    // (342:8) {#if menu.field.type === "semy"}
    function create_if_block_17(ctx) {
    	let div;
    	let editorcharge;
    	let updating_charge;
    	let updating_category;
    	let current;

    	function editorcharge_charge_binding(value) {
    		/*editorcharge_charge_binding*/ ctx[19](value);
    	}

    	function editorcharge_category_binding(value) {
    		/*editorcharge_category_binding*/ ctx[20](value);
    	}

    	let editorcharge_props = {
    		type: "semy",
    		t1: /*menu*/ ctx[0].field.t1,
    		t2: /*menu*/ ctx[0].field.t2,
    		size: /*menu*/ ctx[0].field.size,
    		itemSize: /*itemSize*/ ctx[4]
    	};

    	if (/*menu*/ ctx[0].field.charge !== void 0) {
    		editorcharge_props.charge = /*menu*/ ctx[0].field.charge;
    	}

    	if (/*menu*/ ctx[0].field.semy !== void 0) {
    		editorcharge_props.category = /*menu*/ ctx[0].field.semy;
    	}

    	editorcharge = new EditorCharge({
    			props: editorcharge_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editorcharge, 'charge', editorcharge_charge_binding));
    	binding_callbacks.push(() => bind(editorcharge, 'category', editorcharge_category_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editorcharge.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-12hcq6k");
    			add_location(div, file$7, 342, 10, 12265);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editorcharge, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editorcharge_changes = {};
    			if (dirty[0] & /*menu*/ 1) editorcharge_changes.t1 = /*menu*/ ctx[0].field.t1;
    			if (dirty[0] & /*menu*/ 1) editorcharge_changes.t2 = /*menu*/ ctx[0].field.t2;
    			if (dirty[0] & /*menu*/ 1) editorcharge_changes.size = /*menu*/ ctx[0].field.size;
    			if (dirty[0] & /*itemSize*/ 16) editorcharge_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_charge && dirty[0] & /*menu*/ 1) {
    				updating_charge = true;
    				editorcharge_changes.charge = /*menu*/ ctx[0].field.charge;
    				add_flush_callback(() => updating_charge = false);
    			}

    			if (!updating_category && dirty[0] & /*menu*/ 1) {
    				updating_category = true;
    				editorcharge_changes.category = /*menu*/ ctx[0].field.semy;
    				add_flush_callback(() => updating_category = false);
    			}

    			editorcharge.$set(editorcharge_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editorcharge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editorcharge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editorcharge);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(342:8) {#if menu.field.type === \\\"semy\\\"}",
    		ctx
    	});

    	return block;
    }

    // (360:4) {#if section.division}
    function create_if_block_9(ctx) {
    	let div1;
    	let div0;
    	let editordivision;
    	let updating_division;
    	let t0;
    	let t1;
    	let div1_transition;
    	let current;

    	function editordivision_division_binding(value) {
    		/*editordivision_division_binding*/ ctx[22](value);
    	}

    	let editordivision_props = {
    		t1: /*coa*/ ctx[1].t1,
    		t: /*coa*/ ctx[1].division
    		? /*coa*/ ctx[1].division.t
    		: /*menu*/ ctx[0].division.t1,
    		line: /*menu*/ ctx[0].division.line,
    		itemSize: /*itemSize*/ ctx[4]
    	};

    	if (/*menu*/ ctx[0].division.division !== void 0) {
    		editordivision_props.division = /*menu*/ ctx[0].division.division;
    	}

    	editordivision = new EditorDivision({
    			props: editordivision_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editordivision, 'division', editordivision_division_binding));
    	let if_block0 = divisions[/*coa*/ ctx[1].division?.division] && create_if_block_15(ctx);
    	let if_block1 = /*coa*/ ctx[1].division && create_if_block_10(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(editordivision.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "subsection svelte-12hcq6k");
    			add_location(div0, file$7, 361, 8, 12912);
    			attr_dev(div1, "class", "panel svelte-12hcq6k");
    			add_location(div1, file$7, 360, 6, 12866);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(editordivision, div0, null);
    			append_dev(div1, t0);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editordivision_changes = {};
    			if (dirty[0] & /*coa*/ 2) editordivision_changes.t1 = /*coa*/ ctx[1].t1;

    			if (dirty[0] & /*coa, menu*/ 3) editordivision_changes.t = /*coa*/ ctx[1].division
    			? /*coa*/ ctx[1].division.t
    			: /*menu*/ ctx[0].division.t1;

    			if (dirty[0] & /*menu*/ 1) editordivision_changes.line = /*menu*/ ctx[0].division.line;
    			if (dirty[0] & /*itemSize*/ 16) editordivision_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_division && dirty[0] & /*menu*/ 1) {
    				updating_division = true;
    				editordivision_changes.division = /*menu*/ ctx[0].division.division;
    				add_flush_callback(() => updating_division = false);
    			}

    			editordivision.$set(editordivision_changes);

    			if (divisions[/*coa*/ ctx[1].division?.division]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*coa*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_15(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*coa*/ ctx[1].division) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*coa*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_10(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editordivision.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editordivision.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(editordivision);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(360:4) {#if section.division}",
    		ctx
    	});

    	return block;
    }

    // (372:8) {#if divisions[coa.division?.division]}
    function create_if_block_15(ctx) {
    	let div;
    	let editorline;
    	let updating_line;
    	let current;

    	function editorline_line_binding(value) {
    		/*editorline_line_binding*/ ctx[23](value);
    	}

    	let editorline_props = {
    		division: /*menu*/ ctx[0].division.division,
    		t1: /*coa*/ ctx[1].t1,
    		t: /*coa*/ ctx[1].division
    		? /*coa*/ ctx[1].division.t
    		: /*menu*/ ctx[0].division.t1,
    		itemSize: /*itemSize*/ ctx[4]
    	};

    	if (/*menu*/ ctx[0].division.line !== void 0) {
    		editorline_props.line = /*menu*/ ctx[0].division.line;
    	}

    	editorline = new EditorLine({ props: editorline_props, $$inline: true });
    	binding_callbacks.push(() => bind(editorline, 'line', editorline_line_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editorline.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-12hcq6k");
    			add_location(div, file$7, 372, 10, 13262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editorline, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editorline_changes = {};
    			if (dirty[0] & /*menu*/ 1) editorline_changes.division = /*menu*/ ctx[0].division.division;
    			if (dirty[0] & /*coa*/ 2) editorline_changes.t1 = /*coa*/ ctx[1].t1;

    			if (dirty[0] & /*coa, menu*/ 3) editorline_changes.t = /*coa*/ ctx[1].division
    			? /*coa*/ ctx[1].division.t
    			: /*menu*/ ctx[0].division.t1;

    			if (dirty[0] & /*itemSize*/ 16) editorline_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_line && dirty[0] & /*menu*/ 1) {
    				updating_line = true;
    				editorline_changes.line = /*menu*/ ctx[0].division.line;
    				add_flush_callback(() => updating_line = false);
    			}

    			editorline.$set(editorline_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editorline.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editorline.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editorline);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(372:8) {#if divisions[coa.division?.division]}",
    		ctx
    	});

    	return block;
    }

    // (384:8) {#if coa.division}
    function create_if_block_10(ctx) {
    	let div0;
    	let editortype;
    	let updating_type;
    	let t0;
    	let t1;
    	let div1;
    	let editortincture;
    	let updating_t1;
    	let t2;
    	let t3;
    	let t4;
    	let if_block3_anchor;
    	let current;

    	function editortype_type_binding_1(value) {
    		/*editortype_type_binding_1*/ ctx[24](value);
    	}

    	let editortype_props = {};

    	if (/*menu*/ ctx[0].division.type !== void 0) {
    		editortype_props.type = /*menu*/ ctx[0].division.type;
    	}

    	editortype = new EditorType({ props: editortype_props, $$inline: true });
    	binding_callbacks.push(() => bind(editortype, 'type', editortype_type_binding_1));
    	let if_block0 = /*menu*/ ctx[0].division.type !== "tincture" && create_if_block_14(ctx);

    	function editortincture_t1_binding_2(value) {
    		/*editortincture_t1_binding_2*/ ctx[26](value);
    	}

    	let editortincture_props = { itemSize: /*itemSize*/ ctx[4] };

    	if (/*menu*/ ctx[0].division.t1 !== void 0) {
    		editortincture_props.t1 = /*menu*/ ctx[0].division.t1;
    	}

    	editortincture = new EditorTincture({
    			props: editortincture_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editortincture, 't1', editortincture_t1_binding_2));
    	let if_block1 = /*menu*/ ctx[0].division.type !== "tincture" && create_if_block_13(ctx);
    	let if_block2 = /*menu*/ ctx[0].division.type === "pattern" && create_if_block_12(ctx);
    	let if_block3 = /*menu*/ ctx[0].division.type === "semy" && create_if_block_11(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(editortype.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div1 = element("div");
    			create_component(editortincture.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    			attr_dev(div0, "class", "subsection svelte-12hcq6k");
    			add_location(div0, file$7, 384, 10, 13618);
    			attr_dev(div1, "class", "subsection svelte-12hcq6k");
    			add_location(div1, file$7, 391, 10, 13866);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(editortype, div0, null);
    			append_dev(div0, t0);
    			if (if_block0) if_block0.m(div0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(editortincture, div1, null);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, if_block3_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editortype_changes = {};

    			if (!updating_type && dirty[0] & /*menu*/ 1) {
    				updating_type = true;
    				editortype_changes.type = /*menu*/ ctx[0].division.type;
    				add_flush_callback(() => updating_type = false);
    			}

    			editortype.$set(editortype_changes);

    			if (/*menu*/ ctx[0].division.type !== "tincture") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_14(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const editortincture_changes = {};
    			if (dirty[0] & /*itemSize*/ 16) editortincture_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_t1 && dirty[0] & /*menu*/ 1) {
    				updating_t1 = true;
    				editortincture_changes.t1 = /*menu*/ ctx[0].division.t1;
    				add_flush_callback(() => updating_t1 = false);
    			}

    			editortincture.$set(editortincture_changes);

    			if (/*menu*/ ctx[0].division.type !== "tincture") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_13(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*menu*/ ctx[0].division.type === "pattern") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_12(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t4.parentNode, t4);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*menu*/ ctx[0].division.type === "semy") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 1) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_11(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editortype.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(editortincture.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editortype.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(editortincture.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(editortype);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(editortincture);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(if_block3_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(384:8) {#if coa.division}",
    		ctx
    	});

    	return block;
    }

    // (387:12) {#if menu.division.type !== "tincture"}
    function create_if_block_14(ctx) {
    	let editorsize;
    	let updating_size;
    	let current;

    	function editorsize_size_binding_1(value) {
    		/*editorsize_size_binding_1*/ ctx[25](value);
    	}

    	let editorsize_props = {};

    	if (/*menu*/ ctx[0].division.size !== void 0) {
    		editorsize_props.size = /*menu*/ ctx[0].division.size;
    	}

    	editorsize = new EditorSize({ props: editorsize_props, $$inline: true });
    	binding_callbacks.push(() => bind(editorsize, 'size', editorsize_size_binding_1));

    	const block = {
    		c: function create() {
    			create_component(editorsize.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(editorsize, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editorsize_changes = {};

    			if (!updating_size && dirty[0] & /*menu*/ 1) {
    				updating_size = true;
    				editorsize_changes.size = /*menu*/ ctx[0].division.size;
    				add_flush_callback(() => updating_size = false);
    			}

    			editorsize.$set(editorsize_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editorsize.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editorsize.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(editorsize, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(387:12) {#if menu.division.type !== \\\"tincture\\\"}",
    		ctx
    	});

    	return block;
    }

    // (396:10) {#if menu.division.type !== "tincture"}
    function create_if_block_13(ctx) {
    	let div;
    	let editortincture;
    	let updating_t1;
    	let current;

    	function editortincture_t1_binding_3(value) {
    		/*editortincture_t1_binding_3*/ ctx[27](value);
    	}

    	let editortincture_props = { itemSize: /*itemSize*/ ctx[4] };

    	if (/*menu*/ ctx[0].division.t2 !== void 0) {
    		editortincture_props.t1 = /*menu*/ ctx[0].division.t2;
    	}

    	editortincture = new EditorTincture({
    			props: editortincture_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editortincture, 't1', editortincture_t1_binding_3));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editortincture.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-12hcq6k");
    			add_location(div, file$7, 396, 12, 14045);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editortincture, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editortincture_changes = {};
    			if (dirty[0] & /*itemSize*/ 16) editortincture_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_t1 && dirty[0] & /*menu*/ 1) {
    				updating_t1 = true;
    				editortincture_changes.t1 = /*menu*/ ctx[0].division.t2;
    				add_flush_callback(() => updating_t1 = false);
    			}

    			editortincture.$set(editortincture_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editortincture.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editortincture.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editortincture);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(396:10) {#if menu.division.type !== \\\"tincture\\\"}",
    		ctx
    	});

    	return block;
    }

    // (402:10) {#if menu.division.type === "pattern"}
    function create_if_block_12(ctx) {
    	let div;
    	let editorpattern;
    	let updating_pattern;
    	let current;

    	function editorpattern_pattern_binding_1(value) {
    		/*editorpattern_pattern_binding_1*/ ctx[28](value);
    	}

    	let editorpattern_props = {
    		t1: /*menu*/ ctx[0].division.t1,
    		t2: /*menu*/ ctx[0].division.t2,
    		size: /*menu*/ ctx[0].division.size,
    		itemSize: /*itemSize*/ ctx[4]
    	};

    	if (/*menu*/ ctx[0].division.pattern !== void 0) {
    		editorpattern_props.pattern = /*menu*/ ctx[0].division.pattern;
    	}

    	editorpattern = new EditorPattern({
    			props: editorpattern_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editorpattern, 'pattern', editorpattern_pattern_binding_1));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editorpattern.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-12hcq6k");
    			add_location(div, file$7, 402, 12, 14244);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editorpattern, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editorpattern_changes = {};
    			if (dirty[0] & /*menu*/ 1) editorpattern_changes.t1 = /*menu*/ ctx[0].division.t1;
    			if (dirty[0] & /*menu*/ 1) editorpattern_changes.t2 = /*menu*/ ctx[0].division.t2;
    			if (dirty[0] & /*menu*/ 1) editorpattern_changes.size = /*menu*/ ctx[0].division.size;
    			if (dirty[0] & /*itemSize*/ 16) editorpattern_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_pattern && dirty[0] & /*menu*/ 1) {
    				updating_pattern = true;
    				editorpattern_changes.pattern = /*menu*/ ctx[0].division.pattern;
    				add_flush_callback(() => updating_pattern = false);
    			}

    			editorpattern.$set(editorpattern_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editorpattern.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editorpattern.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editorpattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(402:10) {#if menu.division.type === \\\"pattern\\\"}",
    		ctx
    	});

    	return block;
    }

    // (408:10) {#if menu.division.type === "semy"}
    function create_if_block_11(ctx) {
    	let div;
    	let editorcharge;
    	let updating_charge;
    	let updating_category;
    	let current;

    	function editorcharge_charge_binding_1(value) {
    		/*editorcharge_charge_binding_1*/ ctx[29](value);
    	}

    	function editorcharge_category_binding_1(value) {
    		/*editorcharge_category_binding_1*/ ctx[30](value);
    	}

    	let editorcharge_props = {
    		type: "semy",
    		t1: /*menu*/ ctx[0].division.t1,
    		t2: /*menu*/ ctx[0].division.t2,
    		size: /*menu*/ ctx[0].division.size,
    		itemSize: /*itemSize*/ ctx[4]
    	};

    	if (/*menu*/ ctx[0].division.charge !== void 0) {
    		editorcharge_props.charge = /*menu*/ ctx[0].division.charge;
    	}

    	if (/*menu*/ ctx[0].division.semy !== void 0) {
    		editorcharge_props.category = /*menu*/ ctx[0].division.semy;
    	}

    	editorcharge = new EditorCharge({
    			props: editorcharge_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editorcharge, 'charge', editorcharge_charge_binding_1));
    	binding_callbacks.push(() => bind(editorcharge, 'category', editorcharge_category_binding_1));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editorcharge.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-12hcq6k");
    			add_location(div, file$7, 408, 12, 14519);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editorcharge, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editorcharge_changes = {};
    			if (dirty[0] & /*menu*/ 1) editorcharge_changes.t1 = /*menu*/ ctx[0].division.t1;
    			if (dirty[0] & /*menu*/ 1) editorcharge_changes.t2 = /*menu*/ ctx[0].division.t2;
    			if (dirty[0] & /*menu*/ 1) editorcharge_changes.size = /*menu*/ ctx[0].division.size;
    			if (dirty[0] & /*itemSize*/ 16) editorcharge_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_charge && dirty[0] & /*menu*/ 1) {
    				updating_charge = true;
    				editorcharge_changes.charge = /*menu*/ ctx[0].division.charge;
    				add_flush_callback(() => updating_charge = false);
    			}

    			if (!updating_category && dirty[0] & /*menu*/ 1) {
    				updating_category = true;
    				editorcharge_changes.category = /*menu*/ ctx[0].division.semy;
    				add_flush_callback(() => updating_category = false);
    			}

    			editorcharge.$set(editorcharge_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editorcharge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editorcharge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editorcharge);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(408:10) {#if menu.division.type === \\\"semy\\\"}",
    		ctx
    	});

    	return block;
    }

    // (429:8) {#if o.above}
    function create_if_block_8(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			i.textContent = "[above charges]";
    			attr_dev(i, "class", "svelte-12hcq6k");
    			add_location(i, file$7, 429, 10, 15279);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(429:8) {#if o.above}",
    		ctx
    	});

    	return block;
    }

    // (434:6) {#if section.ordinary[i]}
    function create_if_block_3$1(ctx) {
    	let div3;
    	let t0;
    	let div0;
    	let editorordinary;
    	let updating_ordinary;
    	let t1;
    	let t2;
    	let t3;
    	let div1;
    	let show_if = !["bordure", "orle"].includes(/*o*/ ctx[63].ordinary);
    	let t4;
    	let editorabove;
    	let updating_above;
    	let t5;
    	let div2;
    	let editorshift;
    	let updating_e;
    	let t6;
    	let div3_transition;
    	let current;
    	let if_block0 = /*coa*/ ctx[1].division && create_if_block_7$1(ctx);

    	function editorordinary_ordinary_binding(value) {
    		/*editorordinary_ordinary_binding*/ ctx[34](value, /*o*/ ctx[63]);
    	}

    	let editorordinary_props = {
    		t1: /*coa*/ ctx[1].t1,
    		line: /*o*/ ctx[63].line,
    		t: /*o*/ ctx[63].t,
    		itemSize: /*itemSize*/ ctx[4]
    	};

    	if (/*o*/ ctx[63].ordinary !== void 0) {
    		editorordinary_props.ordinary = /*o*/ ctx[63].ordinary;
    	}

    	editorordinary = new EditorOrdinary({
    			props: editorordinary_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editorordinary, 'ordinary', editorordinary_ordinary_binding));
    	let if_block1 = ordinaries.lined[/*o*/ ctx[63].ordinary] && create_if_block_6$1(ctx);
    	let if_block2 = /*o*/ ctx[63].divided !== "counter" && create_if_block_5$1(ctx);
    	let if_block3 = show_if && create_if_block_4$1(ctx);

    	function editorabove_above_binding(value) {
    		/*editorabove_above_binding*/ ctx[38](value, /*o*/ ctx[63]);
    	}

    	let editorabove_props = {};

    	if (/*o*/ ctx[63].above !== void 0) {
    		editorabove_props.above = /*o*/ ctx[63].above;
    	}

    	editorabove = new EditorAbove({ props: editorabove_props, $$inline: true });
    	binding_callbacks.push(() => bind(editorabove, 'above', editorabove_above_binding));

    	function editorshift_e_binding(value) {
    		/*editorshift_e_binding*/ ctx[39](value, /*o*/ ctx[63], /*each_value_1*/ ctx[64], /*i*/ ctx[62]);
    	}

    	let editorshift_props = {};

    	if (/*o*/ ctx[63] !== void 0) {
    		editorshift_props.e = /*o*/ ctx[63];
    	}

    	editorshift = new EditorShift({ props: editorshift_props, $$inline: true });
    	binding_callbacks.push(() => bind(editorshift, 'e', editorshift_e_binding));

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			create_component(editorordinary.$$.fragment);
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			div1 = element("div");
    			if (if_block3) if_block3.c();
    			t4 = space();
    			create_component(editorabove.$$.fragment);
    			t5 = space();
    			div2 = element("div");
    			create_component(editorshift.$$.fragment);
    			t6 = space();
    			attr_dev(div0, "class", "subsection svelte-12hcq6k");
    			add_location(div0, file$7, 441, 10, 15652);
    			attr_dev(div1, "class", "subsection svelte-12hcq6k");
    			add_location(div1, file$7, 457, 10, 16214);
    			attr_dev(div2, "class", "subsection svelte-12hcq6k");
    			add_location(div2, file$7, 464, 10, 16449);
    			attr_dev(div3, "class", "panel svelte-12hcq6k");
    			add_location(div3, file$7, 434, 8, 15439);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t0);
    			append_dev(div3, div0);
    			mount_component(editorordinary, div0, null);
    			append_dev(div3, t1);
    			if (if_block1) if_block1.m(div3, null);
    			append_dev(div3, t2);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			if (if_block3) if_block3.m(div1, null);
    			append_dev(div1, t4);
    			mount_component(editorabove, div1, null);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			mount_component(editorshift, div2, null);
    			append_dev(div3, t6);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*coa*/ ctx[1].division) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*coa*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div3, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const editorordinary_changes = {};
    			if (dirty[0] & /*coa*/ 2) editorordinary_changes.t1 = /*coa*/ ctx[1].t1;
    			if (dirty[0] & /*menu*/ 1) editorordinary_changes.line = /*o*/ ctx[63].line;
    			if (dirty[0] & /*menu*/ 1) editorordinary_changes.t = /*o*/ ctx[63].t;
    			if (dirty[0] & /*itemSize*/ 16) editorordinary_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_ordinary && dirty[0] & /*menu*/ 1) {
    				updating_ordinary = true;
    				editorordinary_changes.ordinary = /*o*/ ctx[63].ordinary;
    				add_flush_callback(() => updating_ordinary = false);
    			}

    			editorordinary.$set(editorordinary_changes);

    			if (ordinaries.lined[/*o*/ ctx[63].ordinary]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_6$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div3, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*o*/ ctx[63].divided !== "counter") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_5$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div3, t3);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*menu*/ 1) show_if = !["bordure", "orle"].includes(/*o*/ ctx[63].ordinary);

    			if (show_if) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 1) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_4$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div1, t4);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			const editorabove_changes = {};

    			if (!updating_above && dirty[0] & /*menu*/ 1) {
    				updating_above = true;
    				editorabove_changes.above = /*o*/ ctx[63].above;
    				add_flush_callback(() => updating_above = false);
    			}

    			editorabove.$set(editorabove_changes);
    			const editorshift_changes = {};

    			if (!updating_e && dirty[0] & /*menu*/ 1) {
    				updating_e = true;
    				editorshift_changes.e = /*o*/ ctx[63];
    				add_flush_callback(() => updating_e = false);
    			}

    			editorshift.$set(editorshift_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(editorordinary.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(editorabove.$$.fragment, local);
    			transition_in(editorshift.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(editorordinary.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(editorabove.$$.fragment, local);
    			transition_out(editorshift.$$.fragment, local);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			destroy_component(editorordinary);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			destroy_component(editorabove);
    			destroy_component(editorshift);
    			if (detaching && div3_transition) div3_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(434:6) {#if section.ordinary[i]}",
    		ctx
    	});

    	return block;
    }

    // (436:10) {#if coa.division}
    function create_if_block_7$1(ctx) {
    	let div;
    	let editordivided;
    	let updating_divided;
    	let current;

    	function editordivided_divided_binding(value) {
    		/*editordivided_divided_binding*/ ctx[33](value, /*o*/ ctx[63]);
    	}

    	let editordivided_props = {};

    	if (/*o*/ ctx[63].divided !== void 0) {
    		editordivided_props.divided = /*o*/ ctx[63].divided;
    	}

    	editordivided = new EditorDivided({
    			props: editordivided_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editordivided, 'divided', editordivided_divided_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editordivided.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-12hcq6k");
    			add_location(div, file$7, 436, 12, 15519);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editordivided, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const editordivided_changes = {};

    			if (!updating_divided && dirty[0] & /*menu*/ 1) {
    				updating_divided = true;
    				editordivided_changes.divided = /*o*/ ctx[63].divided;
    				add_flush_callback(() => updating_divided = false);
    			}

    			editordivided.$set(editordivided_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editordivided.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editordivided.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editordivided);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(436:10) {#if coa.division}",
    		ctx
    	});

    	return block;
    }

    // (446:10) {#if ordinaries.lined[o.ordinary]}
    function create_if_block_6$1(ctx) {
    	let div;
    	let editorline;
    	let updating_line;
    	let current;

    	function editorline_line_binding_1(value) {
    		/*editorline_line_binding_1*/ ctx[35](value, /*o*/ ctx[63]);
    	}

    	let editorline_props = {
    		ordinary: /*o*/ ctx[63].ordinary,
    		t1: /*coa*/ ctx[1].t1,
    		t: /*o*/ ctx[63].t,
    		itemSize: /*itemSize*/ ctx[4]
    	};

    	if (/*o*/ ctx[63].line !== void 0) {
    		editorline_props.line = /*o*/ ctx[63].line;
    	}

    	editorline = new EditorLine({ props: editorline_props, $$inline: true });
    	binding_callbacks.push(() => bind(editorline, 'line', editorline_line_binding_1));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editorline.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-12hcq6k");
    			add_location(div, file$7, 446, 12, 15860);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editorline, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const editorline_changes = {};
    			if (dirty[0] & /*menu*/ 1) editorline_changes.ordinary = /*o*/ ctx[63].ordinary;
    			if (dirty[0] & /*coa*/ 2) editorline_changes.t1 = /*coa*/ ctx[1].t1;
    			if (dirty[0] & /*menu*/ 1) editorline_changes.t = /*o*/ ctx[63].t;
    			if (dirty[0] & /*itemSize*/ 16) editorline_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_line && dirty[0] & /*menu*/ 1) {
    				updating_line = true;
    				editorline_changes.line = /*o*/ ctx[63].line;
    				add_flush_callback(() => updating_line = false);
    			}

    			editorline.$set(editorline_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editorline.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editorline.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editorline);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(446:10) {#if ordinaries.lined[o.ordinary]}",
    		ctx
    	});

    	return block;
    }

    // (452:10) {#if o.divided !== "counter"}
    function create_if_block_5$1(ctx) {
    	let div;
    	let editortincture;
    	let updating_t1;
    	let current;

    	function editortincture_t1_binding_4(value) {
    		/*editortincture_t1_binding_4*/ ctx[36](value, /*o*/ ctx[63]);
    	}

    	let editortincture_props = { itemSize: /*itemSize*/ ctx[4] };

    	if (/*o*/ ctx[63].t !== void 0) {
    		editortincture_props.t1 = /*o*/ ctx[63].t;
    	}

    	editortincture = new EditorTincture({
    			props: editortincture_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editortincture, 't1', editortincture_t1_binding_4));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editortincture.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-12hcq6k");
    			add_location(div, file$7, 452, 12, 16080);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editortincture, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const editortincture_changes = {};
    			if (dirty[0] & /*itemSize*/ 16) editortincture_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_t1 && dirty[0] & /*menu*/ 1) {
    				updating_t1 = true;
    				editortincture_changes.t1 = /*o*/ ctx[63].t;
    				add_flush_callback(() => updating_t1 = false);
    			}

    			editortincture.$set(editortincture_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editortincture.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editortincture.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editortincture);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(452:10) {#if o.divided !== \\\"counter\\\"}",
    		ctx
    	});

    	return block;
    }

    // (459:12) {#if !["bordure", "orle"].includes(o.ordinary)}
    function create_if_block_4$1(ctx) {
    	let editorstroke;
    	let updating_element;
    	let current;

    	function editorstroke_element_binding(value) {
    		/*editorstroke_element_binding*/ ctx[37](value, /*o*/ ctx[63], /*each_value_1*/ ctx[64], /*i*/ ctx[62]);
    	}

    	let editorstroke_props = {};

    	if (/*o*/ ctx[63] !== void 0) {
    		editorstroke_props.element = /*o*/ ctx[63];
    	}

    	editorstroke = new EditorStroke({
    			props: editorstroke_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editorstroke, 'element', editorstroke_element_binding));

    	const block = {
    		c: function create() {
    			create_component(editorstroke.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(editorstroke, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const editorstroke_changes = {};

    			if (!updating_element && dirty[0] & /*menu*/ 1) {
    				updating_element = true;
    				editorstroke_changes.element = /*o*/ ctx[63];
    				add_flush_callback(() => updating_element = false);
    			}

    			editorstroke.$set(editorstroke_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editorstroke.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editorstroke.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(editorstroke, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(459:12) {#if ![\\\"bordure\\\", \\\"orle\\\"].includes(o.ordinary)}",
    		ctx
    	});

    	return block;
    }

    // (426:4) {#each menu.ordinaries as o, i}
    function create_each_block_1$1(ctx) {
    	let div;
    	let t0;

    	let t1_value = (/*menu*/ ctx[0].ordinaries.length > 1
    	? " " + (/*i*/ ctx[62] + 1)
    	: "") + "";

    	let t1;
    	let t2;
    	let t3_value = cap(/*o*/ ctx[63].ordinary) + "";
    	let t3;
    	let t4;
    	let t5;
    	let editorcontrols;
    	let updating_els;
    	let div_transition;
    	let t6;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*o*/ ctx[63].above && create_if_block_8(ctx);

    	function editorcontrols_els_binding(value) {
    		/*editorcontrols_els_binding*/ ctx[31](value);
    	}

    	let editorcontrols_props = { el: /*o*/ ctx[63], i: /*i*/ ctx[62] };

    	if (/*menu*/ ctx[0].ordinaries !== void 0) {
    		editorcontrols_props.els = /*menu*/ ctx[0].ordinaries;
    	}

    	editorcontrols = new EditorControls({
    			props: editorcontrols_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editorcontrols, 'els', editorcontrols_els_binding));

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[32](/*i*/ ctx[62]);
    	}

    	let if_block1 = /*section*/ ctx[2].ordinary[/*i*/ ctx[62]] && create_if_block_3$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Ordinary");
    			t1 = text(t1_value);
    			t2 = text(": ");
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			create_component(editorcontrols.$$.fragment);
    			t6 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div, "class", "section svelte-12hcq6k");
    			toggle_class(div, "expanded", /*section*/ ctx[2].ordinary[/*i*/ ctx[62]]);
    			add_location(div, file$7, 426, 6, 15021);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t5);
    			mount_component(editorcontrols, div, null);
    			insert_dev(target, t6, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if ((!current || dirty[0] & /*menu*/ 1) && t1_value !== (t1_value = (/*menu*/ ctx[0].ordinaries.length > 1
    			? " " + (/*i*/ ctx[62] + 1)
    			: "") + "")) set_data_dev(t1, t1_value);

    			if ((!current || dirty[0] & /*menu*/ 1) && t3_value !== (t3_value = cap(/*o*/ ctx[63].ordinary) + "")) set_data_dev(t3, t3_value);

    			if (/*o*/ ctx[63].above) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					if_block0.m(div, t5);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			const editorcontrols_changes = {};
    			if (dirty[0] & /*menu*/ 1) editorcontrols_changes.el = /*o*/ ctx[63];

    			if (!updating_els && dirty[0] & /*menu*/ 1) {
    				updating_els = true;
    				editorcontrols_changes.els = /*menu*/ ctx[0].ordinaries;
    				add_flush_callback(() => updating_els = false);
    			}

    			editorcontrols.$set(editorcontrols_changes);

    			if (dirty[0] & /*section*/ 4) {
    				toggle_class(div, "expanded", /*section*/ ctx[2].ordinary[/*i*/ ctx[62]]);
    			}

    			if (/*section*/ ctx[2].ordinary[/*i*/ ctx[62]]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*section*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_3$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editorcontrols.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editorcontrols.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			destroy_component(editorcontrols);
    			if (detaching && div_transition) div_transition.end();
    			if (detaching) detach_dev(t6);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(426:4) {#each menu.ordinaries as o, i}",
    		ctx
    	});

    	return block;
    }

    // (478:6) {#if section.charge[i]}
    function create_if_block$4(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let editorcharge;
    	let updating_charge;
    	let updating_category;
    	let t1;
    	let show_if = !isRaster(/*charge*/ ctx[60].charge) && /*charge*/ ctx[60].divided !== "counter";
    	let t2;
    	let div1;
    	let editorstroke;
    	let updating_element;
    	let t3;
    	let div2;
    	let editorposition;
    	let updating_charge_1;
    	let t4;
    	let div3;
    	let editorshift;
    	let updating_e;
    	let div4_transition;
    	let current;
    	let if_block0 = /*coa*/ ctx[1].division && create_if_block_2$2(ctx);

    	function editorcharge_charge_binding_2(value) {
    		/*editorcharge_charge_binding_2*/ ctx[43](value, /*charge*/ ctx[60]);
    	}

    	function editorcharge_category_binding_2(value) {
    		/*editorcharge_category_binding_2*/ ctx[44](value, /*charge*/ ctx[60]);
    	}

    	let editorcharge_props = {
    		type: "charge",
    		t1: /*coa*/ ctx[1].t1,
    		t2: /*charge*/ ctx[60].t,
    		sinister: /*charge*/ ctx[60].sinister,
    		reversed: /*charge*/ ctx[60].reversed,
    		division: /*coa*/ ctx[1].division,
    		itemSize: /*itemSize*/ ctx[4]
    	};

    	if (/*charge*/ ctx[60].charge !== void 0) {
    		editorcharge_props.charge = /*charge*/ ctx[60].charge;
    	}

    	if (/*charge*/ ctx[60].type !== void 0) {
    		editorcharge_props.category = /*charge*/ ctx[60].type;
    	}

    	editorcharge = new EditorCharge({
    			props: editorcharge_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editorcharge, 'charge', editorcharge_charge_binding_2));
    	binding_callbacks.push(() => bind(editorcharge, 'category', editorcharge_category_binding_2));
    	let if_block1 = show_if && create_if_block_1$2(ctx);

    	function editorstroke_element_binding_1(value) {
    		/*editorstroke_element_binding_1*/ ctx[46](value, /*charge*/ ctx[60], /*each_value*/ ctx[61], /*i*/ ctx[62]);
    	}

    	let editorstroke_props = {};

    	if (/*charge*/ ctx[60] !== void 0) {
    		editorstroke_props.element = /*charge*/ ctx[60];
    	}

    	editorstroke = new EditorStroke({
    			props: editorstroke_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editorstroke, 'element', editorstroke_element_binding_1));

    	function editorposition_charge_binding(value) {
    		/*editorposition_charge_binding*/ ctx[47](value, /*charge*/ ctx[60], /*each_value*/ ctx[61], /*i*/ ctx[62]);
    	}

    	let editorposition_props = {};

    	if (/*charge*/ ctx[60] !== void 0) {
    		editorposition_props.charge = /*charge*/ ctx[60];
    	}

    	editorposition = new EditorPosition({
    			props: editorposition_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editorposition, 'charge', editorposition_charge_binding));

    	function editorshift_e_binding_1(value) {
    		/*editorshift_e_binding_1*/ ctx[48](value, /*charge*/ ctx[60], /*each_value*/ ctx[61], /*i*/ ctx[62]);
    	}

    	let editorshift_props = {};

    	if (/*charge*/ ctx[60] !== void 0) {
    		editorshift_props.e = /*charge*/ ctx[60];
    	}

    	editorshift = new EditorShift({ props: editorshift_props, $$inline: true });
    	binding_callbacks.push(() => bind(editorshift, 'e', editorshift_e_binding_1));

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			create_component(editorcharge.$$.fragment);
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			div1 = element("div");
    			create_component(editorstroke.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			create_component(editorposition.$$.fragment);
    			t4 = space();
    			div3 = element("div");
    			create_component(editorshift.$$.fragment);
    			attr_dev(div0, "class", "subsection svelte-12hcq6k");
    			add_location(div0, file$7, 479, 10, 17030);
    			attr_dev(div1, "class", "subsection svelte-12hcq6k");
    			add_location(div1, file$7, 502, 10, 17811);
    			attr_dev(div2, "class", "subsection svelte-12hcq6k");
    			add_location(div2, file$7, 506, 10, 17919);
    			attr_dev(div3, "class", "subsection svelte-12hcq6k");
    			add_location(div3, file$7, 510, 10, 18019);
    			attr_dev(div4, "class", "panel svelte-12hcq6k");
    			add_location(div4, file$7, 478, 8, 16982);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t0);
    			mount_component(editorcharge, div0, null);
    			append_dev(div4, t1);
    			if (if_block1) if_block1.m(div4, null);
    			append_dev(div4, t2);
    			append_dev(div4, div1);
    			mount_component(editorstroke, div1, null);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			mount_component(editorposition, div2, null);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			mount_component(editorshift, div3, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*coa*/ ctx[1].division) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*coa*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const editorcharge_changes = {};
    			if (dirty[0] & /*coa*/ 2) editorcharge_changes.t1 = /*coa*/ ctx[1].t1;
    			if (dirty[0] & /*menu*/ 1) editorcharge_changes.t2 = /*charge*/ ctx[60].t;
    			if (dirty[0] & /*menu*/ 1) editorcharge_changes.sinister = /*charge*/ ctx[60].sinister;
    			if (dirty[0] & /*menu*/ 1) editorcharge_changes.reversed = /*charge*/ ctx[60].reversed;
    			if (dirty[0] & /*coa*/ 2) editorcharge_changes.division = /*coa*/ ctx[1].division;
    			if (dirty[0] & /*itemSize*/ 16) editorcharge_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_charge && dirty[0] & /*menu*/ 1) {
    				updating_charge = true;
    				editorcharge_changes.charge = /*charge*/ ctx[60].charge;
    				add_flush_callback(() => updating_charge = false);
    			}

    			if (!updating_category && dirty[0] & /*menu*/ 1) {
    				updating_category = true;
    				editorcharge_changes.category = /*charge*/ ctx[60].type;
    				add_flush_callback(() => updating_category = false);
    			}

    			editorcharge.$set(editorcharge_changes);
    			if (dirty[0] & /*menu*/ 1) show_if = !isRaster(/*charge*/ ctx[60].charge) && /*charge*/ ctx[60].divided !== "counter";

    			if (show_if) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div4, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const editorstroke_changes = {};

    			if (!updating_element && dirty[0] & /*menu*/ 1) {
    				updating_element = true;
    				editorstroke_changes.element = /*charge*/ ctx[60];
    				add_flush_callback(() => updating_element = false);
    			}

    			editorstroke.$set(editorstroke_changes);
    			const editorposition_changes = {};

    			if (!updating_charge_1 && dirty[0] & /*menu*/ 1) {
    				updating_charge_1 = true;
    				editorposition_changes.charge = /*charge*/ ctx[60];
    				add_flush_callback(() => updating_charge_1 = false);
    			}

    			editorposition.$set(editorposition_changes);
    			const editorshift_changes = {};

    			if (!updating_e && dirty[0] & /*menu*/ 1) {
    				updating_e = true;
    				editorshift_changes.e = /*charge*/ ctx[60];
    				add_flush_callback(() => updating_e = false);
    			}

    			editorshift.$set(editorshift_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(editorcharge.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(editorstroke.$$.fragment, local);
    			transition_in(editorposition.$$.fragment, local);
    			transition_in(editorshift.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, slide, {}, true);
    				div4_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(editorcharge.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(editorstroke.$$.fragment, local);
    			transition_out(editorposition.$$.fragment, local);
    			transition_out(editorshift.$$.fragment, local);
    			if (!div4_transition) div4_transition = create_bidirectional_transition(div4, slide, {}, false);
    			div4_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block0) if_block0.d();
    			destroy_component(editorcharge);
    			if (if_block1) if_block1.d();
    			destroy_component(editorstroke);
    			destroy_component(editorposition);
    			destroy_component(editorshift);
    			if (detaching && div4_transition) div4_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(478:6) {#if section.charge[i]}",
    		ctx
    	});

    	return block;
    }

    // (481:12) {#if coa.division}
    function create_if_block_2$2(ctx) {
    	let editordivided;
    	let updating_divided;
    	let current;

    	function editordivided_divided_binding_1(value) {
    		/*editordivided_divided_binding_1*/ ctx[42](value, /*charge*/ ctx[60]);
    	}

    	let editordivided_props = {
    		raster: isRaster(/*charge*/ ctx[60].charge)
    	};

    	if (/*charge*/ ctx[60].divided !== void 0) {
    		editordivided_props.divided = /*charge*/ ctx[60].divided;
    	}

    	editordivided = new EditorDivided({
    			props: editordivided_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editordivided, 'divided', editordivided_divided_binding_1));

    	const block = {
    		c: function create() {
    			create_component(editordivided.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(editordivided, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const editordivided_changes = {};
    			if (dirty[0] & /*menu*/ 1) editordivided_changes.raster = isRaster(/*charge*/ ctx[60].charge);

    			if (!updating_divided && dirty[0] & /*menu*/ 1) {
    				updating_divided = true;
    				editordivided_changes.divided = /*charge*/ ctx[60].divided;
    				add_flush_callback(() => updating_divided = false);
    			}

    			editordivided.$set(editordivided_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editordivided.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editordivided.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(editordivided, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(481:12) {#if coa.division}",
    		ctx
    	});

    	return block;
    }

    // (497:10) {#if !isRaster(charge.charge) && charge.divided !== "counter"}
    function create_if_block_1$2(ctx) {
    	let div;
    	let editortincture;
    	let updating_t1;
    	let current;

    	function editortincture_t1_binding_5(value) {
    		/*editortincture_t1_binding_5*/ ctx[45](value, /*charge*/ ctx[60]);
    	}

    	let editortincture_props = { itemSize: /*itemSize*/ ctx[4] };

    	if (/*charge*/ ctx[60].t !== void 0) {
    		editortincture_props.t1 = /*charge*/ ctx[60].t;
    	}

    	editortincture = new EditorTincture({
    			props: editortincture_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editortincture, 't1', editortincture_t1_binding_5));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editortincture.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-12hcq6k");
    			add_location(div, file$7, 497, 12, 17672);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editortincture, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const editortincture_changes = {};
    			if (dirty[0] & /*itemSize*/ 16) editortincture_changes.itemSize = /*itemSize*/ ctx[4];

    			if (!updating_t1 && dirty[0] & /*menu*/ 1) {
    				updating_t1 = true;
    				editortincture_changes.t1 = /*charge*/ ctx[60].t;
    				add_flush_callback(() => updating_t1 = false);
    			}

    			editortincture.$set(editortincture_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editortincture.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editortincture.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editortincture);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(497:10) {#if !isRaster(charge.charge) && charge.divided !== \\\"counter\\\"}",
    		ctx
    	});

    	return block;
    }

    // (473:4) {#each menu.charges as charge, i}
    function create_each_block$4(ctx) {
    	let div;
    	let t0;

    	let t1_value = (/*menu*/ ctx[0].charges.length > 1
    	? " " + (/*i*/ ctx[62] + 1)
    	: "") + "";

    	let t1;
    	let t2;
    	let t3_value = cap(/*charge*/ ctx[60].charge) + "";
    	let t3;
    	let t4;
    	let editorcontrols;
    	let updating_els;
    	let div_transition;
    	let t5;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function editorcontrols_els_binding_1(value) {
    		/*editorcontrols_els_binding_1*/ ctx[40](value);
    	}

    	let editorcontrols_props = { el: /*charge*/ ctx[60], i: /*i*/ ctx[62] };

    	if (/*menu*/ ctx[0].charges !== void 0) {
    		editorcontrols_props.els = /*menu*/ ctx[0].charges;
    	}

    	editorcontrols = new EditorControls({
    			props: editorcontrols_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editorcontrols, 'els', editorcontrols_els_binding_1));

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[41](/*i*/ ctx[62]);
    	}

    	let if_block = /*section*/ ctx[2].charge[/*i*/ ctx[62]] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Charge");
    			t1 = text(t1_value);
    			t2 = text(": ");
    			t3 = text(t3_value);
    			t4 = space();
    			create_component(editorcontrols.$$.fragment);
    			t5 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "section svelte-12hcq6k");
    			toggle_class(div, "expanded", /*section*/ ctx[2].charge[/*i*/ ctx[62]]);
    			add_location(div, file$7, 473, 6, 16644);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			mount_component(editorcontrols, div, null);
    			insert_dev(target, t5, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if ((!current || dirty[0] & /*menu*/ 1) && t1_value !== (t1_value = (/*menu*/ ctx[0].charges.length > 1
    			? " " + (/*i*/ ctx[62] + 1)
    			: "") + "")) set_data_dev(t1, t1_value);

    			if ((!current || dirty[0] & /*menu*/ 1) && t3_value !== (t3_value = cap(/*charge*/ ctx[60].charge) + "")) set_data_dev(t3, t3_value);
    			const editorcontrols_changes = {};
    			if (dirty[0] & /*menu*/ 1) editorcontrols_changes.el = /*charge*/ ctx[60];

    			if (!updating_els && dirty[0] & /*menu*/ 1) {
    				updating_els = true;
    				editorcontrols_changes.els = /*menu*/ ctx[0].charges;
    				add_flush_callback(() => updating_els = false);
    			}

    			editorcontrols.$set(editorcontrols_changes);

    			if (dirty[0] & /*section*/ 4) {
    				toggle_class(div, "expanded", /*section*/ ctx[2].charge[/*i*/ ctx[62]]);
    			}

    			if (/*section*/ ctx[2].charge[/*i*/ ctx[62]]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*section*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
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
    			transition_in(editorcontrols.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editorcontrols.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editorcontrols);
    			if (detaching && div_transition) div_transition.end();
    			if (detaching) detach_dev(t5);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(473:4) {#each menu.charges as charge, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div5;
    	let previous_key = /*coa*/ ctx[1];
    	let t0;
    	let div4;
    	let div0;
    	let t2;
    	let t3;
    	let div1;
    	let t4;
    	let t5_value = cap(/*menu*/ ctx[0].division.division) + "";
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let div2;
    	let t11;
    	let div3;
    	let div4_intro;
    	let current;
    	let mounted;
    	let dispose;
    	let key_block = create_key_block$1(ctx);
    	let if_block0 = /*section*/ ctx[2].field && create_if_block_16(ctx);
    	let if_block1 = /*section*/ ctx[2].division && create_if_block_9(ctx);
    	let each_value_1 = /*menu*/ ctx[0].ordinaries;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*menu*/ ctx[0].charges;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			key_block.c();
    			t0 = space();
    			div4 = element("div");
    			div0 = element("div");
    			div0.textContent = "Field";
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			div1 = element("div");
    			t4 = text("Division: ");
    			t5 = text(t5_value);
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t8 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			div2 = element("div");
    			div2.textContent = "Add Ordinary";
    			t11 = space();
    			div3 = element("div");
    			div3.textContent = "Add Charge";
    			attr_dev(div0, "class", "section svelte-12hcq6k");
    			toggle_class(div0, "expanded", /*section*/ ctx[2].field);
    			add_location(div0, file$7, 315, 4, 11248);
    			attr_dev(div1, "class", "section svelte-12hcq6k");
    			toggle_class(div1, "expanded", /*section*/ ctx[2].division);
    			add_location(div1, file$7, 358, 4, 12674);
    			attr_dev(div2, "class", "buttonLine svelte-12hcq6k");
    			add_location(div2, file$7, 517, 4, 18156);
    			attr_dev(div3, "class", "buttonLine svelte-12hcq6k");
    			add_location(div3, file$7, 518, 4, 18227);
    			attr_dev(div4, "id", "menu");
    			set_style(div4, "width", /*width*/ ctx[3] + "%");
    			attr_dev(div4, "class", "svelte-12hcq6k");
    			add_location(div4, file$7, 313, 2, 11149);
    			attr_dev(div5, "id", "editor");
    			attr_dev(div5, "class", "svelte-12hcq6k");
    			add_location(div5, file$7, 309, 0, 11052);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			key_block.m(div5, null);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div4, t2);
    			if (if_block0) if_block0.m(div4, null);
    			append_dev(div4, t3);
    			append_dev(div4, div1);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div4, t6);
    			if (if_block1) if_block1.m(div4, null);
    			append_dev(div4, t7);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div4, null);
    			}

    			append_dev(div4, t8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			append_dev(div4, t9);
    			append_dev(div4, div2);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[13], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[21], false, false, false),
    					listen_dev(div2, "click", /*addOrdinary*/ ctx[6], false, false, false),
    					listen_dev(div3, "click", /*addCharge*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*coa*/ 2 && safe_not_equal(previous_key, previous_key = /*coa*/ ctx[1])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block$1(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(div5, t0);
    			} else {
    				key_block.p(ctx, dirty);
    			}

    			if (dirty[0] & /*section*/ 4) {
    				toggle_class(div0, "expanded", /*section*/ ctx[2].field);
    			}

    			if (/*section*/ ctx[2].field) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*section*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_16(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div4, t3);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty[0] & /*menu*/ 1) && t5_value !== (t5_value = cap(/*menu*/ ctx[0].division.division) + "")) set_data_dev(t5, t5_value);

    			if (dirty[0] & /*section*/ 4) {
    				toggle_class(div1, "expanded", /*section*/ ctx[2].division);
    			}

    			if (/*section*/ ctx[2].division) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*section*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_9(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div4, t7);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*menu, itemSize, coa, section*/ 23) {
    				each_value_1 = /*menu*/ ctx[0].ordinaries;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div4, t8);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*menu, itemSize, coa, section*/ 23) {
    				each_value = /*menu*/ ctx[0].charges;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div4, t9);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*width*/ 8) {
    				set_style(div4, "width", /*width*/ ctx[3] + "%");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			transition_in(if_block0);
    			transition_in(if_block1);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			if (!div4_intro) {
    				add_render_callback(() => {
    					div4_intro = create_in_transition(div4, fly, { x: 1000, duration: 1000 });
    					div4_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			each_blocks_1 = each_blocks_1.filter(Boolean_1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			key_block.d(detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function isTouchDevice() {
    	return "ontouchstart" in window;
    }

    function isRaster(charge) {
    	const el = document.getElementById(charge);
    	return el ? el.tagName === "image" : false;
    }

    function cap(string = "no") {
    	const split = string.split(/(?=[A-Z])/).join(" ");
    	return split.charAt(0).toUpperCase() + split.slice(1);
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $message;
    	let $tinctures;
    	let $state;
    	let $shield;
    	let $changes;
    	let $history;
    	let $showGrid;
    	let $grid;
    	validate_store(message, 'message');
    	component_subscribe($$self, message, $$value => $$invalidate(49, $message = $$value));
    	validate_store(tinctures, 'tinctures');
    	component_subscribe($$self, tinctures, $$value => $$invalidate(50, $tinctures = $$value));
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(51, $state = $$value));
    	validate_store(shield, 'shield');
    	component_subscribe($$self, shield, $$value => $$invalidate(52, $shield = $$value));
    	validate_store(changes, 'changes');
    	component_subscribe($$self, changes, $$value => $$invalidate(10, $changes = $$value));
    	validate_store(history, 'history');
    	component_subscribe($$self, history, $$value => $$invalidate(53, $history = $$value));
    	validate_store(showGrid, 'showGrid');
    	component_subscribe($$self, showGrid, $$value => $$invalidate(11, $showGrid = $$value));
    	validate_store(grid, 'grid');
    	component_subscribe($$self, grid, $$value => $$invalidate(12, $grid = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Editor', slots, []);
    	let { c, seed } = $$props;

    	let menu = {},
    		section = {
    			field: 0,
    			division: 0,
    			ordinary: [],
    			charge: []
    		};

    	const ratio = window.innerHeight / window.innerWidth;

    	const coaSize = window.innerWidth > window.innerHeight
    	? Math.round(window.innerHeight * 0.9)
    	: "100%";

    	let width = window.innerWidth < 600 || ratio > 1
    	? 100
    	: Math.round((1.06 - ratio) * 100);

    	if (width / 100 * window.innerWidth < 300) width = 100;
    	let itemSize = Math.floor(width / 1000 * window.innerWidth - 5); // 10 items in row
    	if (window.innerWidth < 600) itemSize *= 2; // 5 items in row for narrow screens
    	set_store_value(state, $state.transform = null, $state);
    	set_store_value(state, $state.positions = null, $state);
    	let coa = $history[c] || generate(seed || undefined); // on load

    	function reroll(c) {
    		$$invalidate(1, coa = $history[c] || generate(seed || undefined));
    		if (!$history[c]) $history.push(coa);
    		changes.reset();
    		defineMenuState();
    	}

    	function edit(coa) {
    		if (!coa.shield) coa.shield = $shield;
    		changes.add(JSON.stringify(coa));
    	}

    	// get coa from menu on menu change
    	function update() {
    		// remove see reference as it would be confusing
    		delete coa.seed;

    		// field attributes changed
    		if (menu.field.type === "tincture") $$invalidate(1, coa.t1 = menu.field.t1, coa); else {
    			const type = menu.field.type === "semy"
    			? "semy_of_" + menu.field.charge
    			: menu.field.pattern;

    			const attibutes = [type, menu.field.t1, menu.field.t2];
    			if (menu.field.size !== "standard") attibutes.push(menu.field.size);
    			$$invalidate(1, coa.t1 = attibutes.join("-"), coa);
    		}

    		// division attributes changed
    		if (menu.division.division && menu.division.division !== "no") {
    			$$invalidate(1, coa.division = { division: menu.division.division }, coa);
    			if (divisions[menu.division.division]) $$invalidate(1, coa.division.line = menu.division.line, coa);

    			if (menu.division.type === "tincture") $$invalidate(1, coa.division.t = menu.division.t1, coa); else {
    				const attr0 = menu.division.type === "semy"
    				? "semy_of_" + menu.division.charge
    				: menu.division.pattern;

    				const attibutes = [attr0, menu.division.t1, menu.division.t2];
    				if (menu.division.size !== "standard") attibutes.push(menu.division.size);
    				$$invalidate(1, coa.division.t = attibutes.join("-"), coa);
    			}
    		} else delete coa.division;

    		// ordinary attributes changed
    		if (menu.ordinaries.length) {
    			$$invalidate(
    				1,
    				coa.ordinaries = menu.ordinaries.map(o => {
    					const item = { ordinary: o.ordinary, t: o.t };
    					if (ordinaries.lined[o.ordinary]) item.line = o.line;
    					if (coa.division && o.divided) item.divided = o.divided;
    					if (o.showStroke) item.stroke = o.stroke;
    					if (o.showStroke && o.strokeWidth !== 1) item.strokeWidth = o.strokeWidth;
    					if (o.size && o.size !== 1) item.size = o.size;

    					if (o.x || o.y) {
    						item.x = o.x;
    						item.y = o.y;
    					}

    					if (o.angle) item.angle = o.angle;
    					if (o.above) item.above = 1;
    					return item;
    				}),
    				coa
    			);
    		} else delete coa.ordinaries;

    		// charges attributes changed
    		if (menu.charges.length) {
    			$$invalidate(
    				1,
    				coa.charges = menu.charges.map(c => {
    					const item = {
    						charge: c.charge,
    						t: c.t,
    						p: c.p,
    						size: c.size
    					};

    					if (!c.showStroke) item.stroke = "none";
    					if (c.stroke !== "#000000") item.stroke = c.stroke;
    					if (c.divided) item.divided = c.divided;
    					if (c.sinister) item.sinister = 1;
    					if (c.reversed) item.reversed = 1;

    					if (c.x || c.y) {
    						item.x = c.x;
    						item.y = c.y;
    					}

    					if (c.angle) item.angle = c.angle;
    					return item;
    				}),
    				coa
    			);
    		} else delete coa.charges;
    	}

    	function restore() {
    		if (!changes.length()) return;
    		$$invalidate(1, coa = JSON.parse($changes[0]));
    		defineMenuState();
    	}

    	// define initial menu state
    	function defineMenuState() {
    		// Shield
    		if (coa.shield) set_store_value(shield, $shield = coa.shield, $shield);

    		// Field
    		$$invalidate(0, menu.field = getField(), menu);

    		function getField() {
    			const type = isSemy(coa.t1)
    			? "semy"
    			: isPattern(coa.t1) ? "pattern" : "tincture";

    			let t1,
    				t2,
    				pattern = "vair",
    				charge = "lozenge",
    				semy = "conventional",
    				size = "standard";

    			const field = coa.t1.split("-"); // parsed field tincture

    			if (type === "tincture") {
    				t1 = coa.t1;
    				t2 = selectSecondTincture(coa.t1);
    			} else {
    				t1 = field[1];
    				t2 = field[2];
    				size = field[3] || "standard";
    			}

    			if (type === "pattern") pattern = field[0]; else if (type === "semy") {
    				charge = getSemyCharge(field);
    				semy = getSemyType(field);
    			}

    			return {
    				type,
    				t1,
    				t2,
    				pattern,
    				charge,
    				semy,
    				size
    			};
    		}

    		// Division
    		$$invalidate(0, menu.division = getDivision(), menu);

    		function getDivision() {
    			let type = "tincture",
    				division = "no",
    				line = "straight",
    				t1,
    				t2,
    				pattern = "vair",
    				charge = "lozenge",
    				semy = "conventional",
    				size = "standard";

    			if (coa.division) {
    				const tSplit = coa.division.t.split("-"); // parsed division tincture

    				type = isSemy(coa.division.t)
    				? "semy"
    				: isPattern(coa.division.t) ? "pattern" : "tincture";

    				division = coa.division.division;
    				line = coa.division.line || "straight";
    				t1 = type === "tincture" ? coa.division.t : tSplit[1];

    				t2 = type === "tincture"
    				? selectSecondTincture(t1)
    				: tSplit[2];

    				if (type === "pattern") pattern = tSplit[0];

    				if (type === "semy") {
    					charge = getSemyCharge(tSplit);
    					semy = getSemyType(tSplit);
    				}

    				size = tSplit[3] || "standard";
    			} else {
    				t1 = selectSecondTincture(menu.field.t1);
    				t2 = selectSecondTincture(t1);
    			}

    			return {
    				division,
    				line,
    				type,
    				t1,
    				t2,
    				pattern,
    				charge,
    				semy,
    				size
    			};
    		}

    		// Ordinaries
    		$$invalidate(0, menu.ordinaries = getOrdinaries(), menu);

    		function getOrdinaries() {
    			if (!coa.ordinaries) return [];

    			const ordinaries = coa.ordinaries.map(o => {
    				const { ordinary, t } = o;
    				const line = o.line || "straight";
    				const showStroke = Boolean(o.stroke);
    				const stroke = o.stroke || "#000000";
    				const strokeWidth = o.strokeWidth || 1;
    				const size = o.size || 1;
    				const x = o.x || 0;
    				const y = o.y || 0;
    				const angle = o.angle || 0;
    				const divided = o.divided || "";
    				const above = o.above || 0;
    				if (angle) set_store_value(state, $state.transform = `rotate(${angle})`, $state);

    				return {
    					ordinary,
    					t,
    					line,
    					showStroke,
    					stroke,
    					strokeWidth,
    					size,
    					x,
    					y,
    					angle,
    					divided,
    					above
    				};
    			});

    			return ordinaries;
    		}

    		// Charges
    		$$invalidate(0, menu.charges = getCharges(), menu);

    		function getCharges() {
    			if (!coa.charges) return [];

    			const charges = coa.charges.map(c => {
    				const { charge, t, p, size } = c;
    				const type = getChargeCategory(charge);
    				const showStroke = c.stroke !== "none";
    				const stroke = c.stroke || "#000000";
    				const divided = c.divided || "";
    				const sinister = c.sinister || false;
    				const reversed = c.reversed || false;
    				const x = c.x || 0;
    				const y = c.y || 0;
    				const angle = c.angle || 0;
    				if (angle) set_store_value(state, $state.transform = `rotate(${angle})`, $state);

    				return {
    					charge,
    					type,
    					showStroke,
    					stroke,
    					divided,
    					t,
    					p,
    					size,
    					sinister,
    					reversed,
    					x,
    					y,
    					angle
    				};
    			});

    			return charges;
    		}

    		function isPattern(string) {
    			return string?.includes("-");
    		}

    		function isSemy(string) {
    			return string?.slice(0, 4) === "semy";
    		}

    		function getSemyCharge(array) {
    			return array[0].split("_of_")[1];
    		}

    		function getChargeCategory(charge) {
    			const type = Object.keys(charges.types).find(type => charges[type][charge] !== undefined);
    			return type || charge;
    		}

    		function getSemyType(array) {
    			const charge = getSemyCharge(array);
    			return getChargeCategory(charge);
    		}

    		function selectSecondTincture(t1) {
    			const metal = t1 === "argent" || t1 === "or";
    			return rw(metal ? $tinctures.colours : $tinctures.metals);
    		}

    		return menu;
    	}

    	function addOrdinary() {
    		const ordinariesList = Object.keys(ordinaries.lined).concat(Object.keys(ordinaries.straight));
    		const ordinary = ra(ordinariesList);
    		const t = rw($tinctures[rw($tinctures.charge)]);

    		const o = {
    			ordinary,
    			t,
    			showStroke: false,
    			stroke: "#000000",
    			strokeWidth: 1,
    			line: "straight",
    			size: 1,
    			x: 0,
    			y: 0,
    			angle: 0,
    			divided: ""
    		};

    		$$invalidate(0, menu.ordinaries = [...menu.ordinaries, o], menu);
    	}

    	function addCharge() {
    		const type = rw(charges.single);
    		const charge = rw(charges[type]);
    		const t = rw($tinctures[rw($tinctures.charge)]);

    		const с = {
    			charge,
    			t,
    			p: "e",
    			showStroke: true,
    			stroke: "#000000",
    			type,
    			size: 1.5,
    			sinister: false,
    			reversed: false,
    			x: 0,
    			y: 0,
    			angle: 0,
    			divided: ""
    		};

    		$$invalidate(0, menu.charges = [...menu.charges, с], menu);
    	}

    	if (!isTouchDevice() && (coa.ordinaries || coa.charges)) {
    		if (!$message) set_store_value(
    			message,
    			$message = {
    				type: "info",
    				text: "Drag to move, hold SHIFT and drag vertically to resize, hold CONTROL and drag horizontally to rotate",
    				timeout: 4000
    			},
    			$message
    		);
    	}

    	const writable_props = ['c', 'seed'];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Editor> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(2, section.field = !section.field, section);

    	function editortype_type_binding(value) {
    		if ($$self.$$.not_equal(menu.field.type, value)) {
    			menu.field.type = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorsize_size_binding(value) {
    		if ($$self.$$.not_equal(menu.field.size, value)) {
    			menu.field.size = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editortincture_t1_binding(value) {
    		if ($$self.$$.not_equal(menu.field.t1, value)) {
    			menu.field.t1 = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editortincture_t1_binding_1(value) {
    		if ($$self.$$.not_equal(menu.field.t2, value)) {
    			menu.field.t2 = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorpattern_pattern_binding(value) {
    		if ($$self.$$.not_equal(menu.field.pattern, value)) {
    			menu.field.pattern = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorcharge_charge_binding(value) {
    		if ($$self.$$.not_equal(menu.field.charge, value)) {
    			menu.field.charge = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorcharge_category_binding(value) {
    		if ($$self.$$.not_equal(menu.field.semy, value)) {
    			menu.field.semy = value;
    			$$invalidate(0, menu);
    		}
    	}

    	const click_handler_1 = () => $$invalidate(2, section.division = !section.division, section);

    	function editordivision_division_binding(value) {
    		if ($$self.$$.not_equal(menu.division.division, value)) {
    			menu.division.division = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorline_line_binding(value) {
    		if ($$self.$$.not_equal(menu.division.line, value)) {
    			menu.division.line = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editortype_type_binding_1(value) {
    		if ($$self.$$.not_equal(menu.division.type, value)) {
    			menu.division.type = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorsize_size_binding_1(value) {
    		if ($$self.$$.not_equal(menu.division.size, value)) {
    			menu.division.size = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editortincture_t1_binding_2(value) {
    		if ($$self.$$.not_equal(menu.division.t1, value)) {
    			menu.division.t1 = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editortincture_t1_binding_3(value) {
    		if ($$self.$$.not_equal(menu.division.t2, value)) {
    			menu.division.t2 = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorpattern_pattern_binding_1(value) {
    		if ($$self.$$.not_equal(menu.division.pattern, value)) {
    			menu.division.pattern = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorcharge_charge_binding_1(value) {
    		if ($$self.$$.not_equal(menu.division.charge, value)) {
    			menu.division.charge = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorcharge_category_binding_1(value) {
    		if ($$self.$$.not_equal(menu.division.semy, value)) {
    			menu.division.semy = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorcontrols_els_binding(value) {
    		if ($$self.$$.not_equal(menu.ordinaries, value)) {
    			menu.ordinaries = value;
    			$$invalidate(0, menu);
    		}
    	}

    	const click_handler_2 = i => $$invalidate(2, section.ordinary[i] = !section.ordinary[i], section);

    	function editordivided_divided_binding(value, o) {
    		if ($$self.$$.not_equal(o.divided, value)) {
    			o.divided = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorordinary_ordinary_binding(value, o) {
    		if ($$self.$$.not_equal(o.ordinary, value)) {
    			o.ordinary = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorline_line_binding_1(value, o) {
    		if ($$self.$$.not_equal(o.line, value)) {
    			o.line = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editortincture_t1_binding_4(value, o) {
    		if ($$self.$$.not_equal(o.t, value)) {
    			o.t = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorstroke_element_binding(value, o, each_value_1, i) {
    		each_value_1[i] = value;
    		$$invalidate(0, menu);
    	}

    	function editorabove_above_binding(value, o) {
    		if ($$self.$$.not_equal(o.above, value)) {
    			o.above = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorshift_e_binding(value, o, each_value_1, i) {
    		each_value_1[i] = value;
    		$$invalidate(0, menu);
    	}

    	function editorcontrols_els_binding_1(value) {
    		if ($$self.$$.not_equal(menu.charges, value)) {
    			menu.charges = value;
    			$$invalidate(0, menu);
    		}
    	}

    	const click_handler_3 = i => $$invalidate(2, section.charge[i] = !section.charge[i], section);

    	function editordivided_divided_binding_1(value, charge) {
    		if ($$self.$$.not_equal(charge.divided, value)) {
    			charge.divided = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorcharge_charge_binding_2(value, charge) {
    		if ($$self.$$.not_equal(charge.charge, value)) {
    			charge.charge = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorcharge_category_binding_2(value, charge) {
    		if ($$self.$$.not_equal(charge.type, value)) {
    			charge.type = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editortincture_t1_binding_5(value, charge) {
    		if ($$self.$$.not_equal(charge.t, value)) {
    			charge.t = value;
    			$$invalidate(0, menu);
    		}
    	}

    	function editorstroke_element_binding_1(value, charge, each_value, i) {
    		each_value[i] = value;
    		$$invalidate(0, menu);
    	}

    	function editorposition_charge_binding(value, charge, each_value, i) {
    		each_value[i] = value;
    		$$invalidate(0, menu);
    	}

    	function editorshift_e_binding_1(value, charge, each_value, i) {
    		each_value[i] = value;
    		$$invalidate(0, menu);
    	}

    	$$self.$$set = $$props => {
    		if ('c' in $$props) $$invalidate(8, c = $$props.c);
    		if ('seed' in $$props) $$invalidate(9, seed = $$props.seed);
    	};

    	$$self.$capture_state = () => ({
    		COA,
    		EditorType,
    		EditorSize,
    		EditorTincture,
    		EditorPattern,
    		EditorCharge,
    		EditorDivision,
    		EditorDivided,
    		EditorLine,
    		EditorOrdinary,
    		EditorStroke,
    		EditorPosition,
    		EditorShift,
    		EditorControls,
    		EditorAbove,
    		slide,
    		fly,
    		history,
    		changes,
    		tinctures,
    		state,
    		grid,
    		showGrid,
    		message,
    		shield,
    		charges,
    		divisions,
    		ordinaries,
    		generate,
    		rw,
    		ra,
    		c,
    		seed,
    		menu,
    		section,
    		ratio,
    		coaSize,
    		width,
    		itemSize,
    		coa,
    		reroll,
    		edit,
    		update,
    		restore,
    		defineMenuState,
    		addOrdinary,
    		addCharge,
    		isTouchDevice,
    		isRaster,
    		cap,
    		$message,
    		$tinctures,
    		$state,
    		$shield,
    		$changes,
    		$history,
    		$showGrid,
    		$grid
    	});

    	$$self.$inject_state = $$props => {
    		if ('c' in $$props) $$invalidate(8, c = $$props.c);
    		if ('seed' in $$props) $$invalidate(9, seed = $$props.seed);
    		if ('menu' in $$props) $$invalidate(0, menu = $$props.menu);
    		if ('section' in $$props) $$invalidate(2, section = $$props.section);
    		if ('width' in $$props) $$invalidate(3, width = $$props.width);
    		if ('itemSize' in $$props) $$invalidate(4, itemSize = $$props.itemSize);
    		if ('coa' in $$props) $$invalidate(1, coa = $$props.coa);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$changes*/ 1024) {
    			restore(); // on undo/redo
    		}

    		if ($$self.$$.dirty[0] & /*c*/ 256) {
    			reroll(c); // on reroll
    		}

    		if ($$self.$$.dirty[0] & /*menu*/ 1) {
    			update(); // on menu update
    		}

    		if ($$self.$$.dirty[0] & /*coa*/ 2) {
    			edit(coa); // on edit
    		}

    		if ($$self.$$.dirty[0] & /*$grid*/ 4096) {
    			localStorage.setItem("grid", $grid); // on grid change
    		}

    		if ($$self.$$.dirty[0] & /*$showGrid*/ 2048) {
    			localStorage.setItem("showGrid", $showGrid); // on grid change
    		}
    	};

    	return [
    		menu,
    		coa,
    		section,
    		width,
    		itemSize,
    		coaSize,
    		addOrdinary,
    		addCharge,
    		c,
    		seed,
    		$changes,
    		$showGrid,
    		$grid,
    		click_handler,
    		editortype_type_binding,
    		editorsize_size_binding,
    		editortincture_t1_binding,
    		editortincture_t1_binding_1,
    		editorpattern_pattern_binding,
    		editorcharge_charge_binding,
    		editorcharge_category_binding,
    		click_handler_1,
    		editordivision_division_binding,
    		editorline_line_binding,
    		editortype_type_binding_1,
    		editorsize_size_binding_1,
    		editortincture_t1_binding_2,
    		editortincture_t1_binding_3,
    		editorpattern_pattern_binding_1,
    		editorcharge_charge_binding_1,
    		editorcharge_category_binding_1,
    		editorcontrols_els_binding,
    		click_handler_2,
    		editordivided_divided_binding,
    		editorordinary_ordinary_binding,
    		editorline_line_binding_1,
    		editortincture_t1_binding_4,
    		editorstroke_element_binding,
    		editorabove_above_binding,
    		editorshift_e_binding,
    		editorcontrols_els_binding_1,
    		click_handler_3,
    		editordivided_divided_binding_1,
    		editorcharge_charge_binding_2,
    		editorcharge_category_binding_2,
    		editortincture_t1_binding_5,
    		editorstroke_element_binding_1,
    		editorposition_charge_binding,
    		editorshift_e_binding_1
    	];
    }

    class Editor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { c: 8, seed: 9 }, null, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Editor",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*c*/ ctx[8] === undefined && !('c' in props)) {
    			console.warn("<Editor> was created without expected prop 'c'");
    		}

    		if (/*seed*/ ctx[9] === undefined && !('seed' in props)) {
    			console.warn("<Editor> was created without expected prop 'seed'");
    		}
    	}

    	get c() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set c(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get seed() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set seed(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\navigation\Gallery.svelte generated by Svelte v3.44.2 */
    const file$6 = "src\\components\\navigation\\Gallery.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (34:6) {#key coa}
    function create_key_block(ctx) {
    	let coa;
    	let current;

    	coa = new COA({
    			props: {
    				coa: /*coa*/ ctx[14],
    				i: /*i*/ ctx[16],
    				w: /*w*/ ctx[0],
    				h: /*h*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(coa.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(coa, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const coa_changes = {};
    			if (dirty & /*coas*/ 4) coa_changes.coa = /*coa*/ ctx[14];
    			if (dirty & /*w*/ 1) coa_changes.w = /*w*/ ctx[0];
    			if (dirty & /*h*/ 2) coa_changes.h = /*h*/ ctx[1];
    			coa.$set(coa_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(coa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(coa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(coa, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(34:6) {#key coa}",
    		ctx
    	});

    	return block;
    }

    // (32:2) {#each coas as coa, i}
    function create_each_block$3(ctx) {
    	let div1;
    	let previous_key = /*coa*/ ctx[14];
    	let t0;
    	let div0;
    	let svg0;
    	let use0;
    	let t1;
    	let svg1;
    	let use1;
    	let t2;
    	let svg2;
    	let use2;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	let key_block = create_key_block(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*i*/ ctx[16]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[9](/*i*/ ctx[16]);
    	}

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[10](/*i*/ ctx[16]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			key_block.c();
    			t0 = space();
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			use0 = svg_element("use");
    			t1 = space();
    			svg1 = svg_element("svg");
    			use1 = svg_element("use");
    			t2 = space();
    			svg2 = svg_element("svg");
    			use2 = svg_element("use");
    			t3 = space();
    			attr_dev(use0, "href", "#dice-icon");
    			add_location(use0, file$6, 37, 44, 1024);
    			attr_dev(svg0, "class", "svelte-1cnn5rr");
    			add_location(svg0, file$6, 37, 8, 988);
    			attr_dev(use1, "href", "#pencil-icon");
    			add_location(use1, file$6, 38, 41, 1098);
    			attr_dev(svg1, "class", "svelte-1cnn5rr");
    			add_location(svg1, file$6, 38, 8, 1065);
    			attr_dev(use2, "href", "#download-icon");
    			add_location(use2, file$6, 39, 42, 1175);
    			attr_dev(svg2, "class", "svelte-1cnn5rr");
    			add_location(svg2, file$6, 39, 8, 1141);
    			attr_dev(div0, "class", "control svelte-1cnn5rr");
    			add_location(div0, file$6, 36, 6, 957);
    			attr_dev(div1, "class", "svelte-1cnn5rr");
    			add_location(div1, file$6, 32, 4, 877);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			key_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, use0);
    			append_dev(div0, t1);
    			append_dev(div0, svg1);
    			append_dev(svg1, use1);
    			append_dev(div0, t2);
    			append_dev(div0, svg2);
    			append_dev(svg2, use2);
    			append_dev(div1, t3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg0, "click", click_handler, false, false, false),
    					listen_dev(svg1, "click", click_handler_1, false, false, false),
    					listen_dev(svg2, "click", click_handler_2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*coas*/ 4 && safe_not_equal(previous_key, previous_key = /*coa*/ ctx[14])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(div1, t0);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			key_block.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(32:2) {#each coas as coa, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let each_value = /*coas*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
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

    			attr_dev(div, "id", "gallery");
    			set_style(div, "font-size", /*font*/ ctx[3] + "px");
    			attr_dev(div, "class", "svelte-1cnn5rr");
    			add_location(div, file$6, 30, 0, 783);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*download, editCOA, regenerate, coas, w, h*/ 55) {
    				each_value = /*coas*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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

    			if (!current || dirty & /*font*/ 8) {
    				set_style(div, "font-size", /*font*/ ctx[3] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
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
    	let font;
    	let coas;
    	let $state;
    	let $history;
    	let $matrix;
    	let $matrices;
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(11, $state = $$value));
    	validate_store(history, 'history');
    	component_subscribe($$self, history, $$value => $$invalidate(7, $history = $$value));
    	validate_store(matrix, 'matrix');
    	component_subscribe($$self, matrix, $$value => $$invalidate(12, $matrix = $$value));
    	validate_store(matrices, 'matrices');
    	component_subscribe($$self, matrices, $$value => $$invalidate(13, $matrices = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Gallery', slots, []);
    	let { gallery, w, h } = $$props;

    	function regenerate(i) {
    		set_store_value(state, $state.i = i, $state);
    		set_store_value(matrix, $matrix++, $matrix);
    		set_store_value(matrices, $matrices[$matrix] = $matrices[$matrix - 1].slice(), $matrices);
    		set_store_value(matrices, $matrices[$matrix][$state.i] = $history.length, $matrices);
    	}

    	function editCOA(i) {
    		set_store_value(state, $state.edit = 1, $state);
    		set_store_value(state, $state.c = gallery[i], $state);
    		set_store_value(state, $state.i = i, $state);
    	}

    	const writable_props = ['gallery', 'w', 'h'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => regenerate(i);
    	const click_handler_1 = i => editCOA(i);
    	const click_handler_2 = i => download(i);

    	$$self.$$set = $$props => {
    		if ('gallery' in $$props) $$invalidate(6, gallery = $$props.gallery);
    		if ('w' in $$props) $$invalidate(0, w = $$props.w);
    		if ('h' in $$props) $$invalidate(1, h = $$props.h);
    	};

    	$$self.$capture_state = () => ({
    		COA,
    		fade,
    		generate,
    		download,
    		history,
    		matrices,
    		matrix,
    		state,
    		gallery,
    		w,
    		h,
    		regenerate,
    		editCOA,
    		coas,
    		font,
    		$state,
    		$history,
    		$matrix,
    		$matrices
    	});

    	$$self.$inject_state = $$props => {
    		if ('gallery' in $$props) $$invalidate(6, gallery = $$props.gallery);
    		if ('w' in $$props) $$invalidate(0, w = $$props.w);
    		if ('h' in $$props) $$invalidate(1, h = $$props.h);
    		if ('coas' in $$props) $$invalidate(2, coas = $$props.coas);
    		if ('font' in $$props) $$invalidate(3, font = $$props.font);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*w*/ 1) {
    			$$invalidate(3, font = Math.max(Math.min(Math.ceil(w / 20), 12), 6));
    		}

    		if ($$self.$$.dirty & /*gallery, $history*/ 192) {
    			$$invalidate(2, coas = gallery.map(c => {
    				let coa = $history[c] || generate();
    				if (!$history[c]) set_store_value(history, $history[c] = coa, $history);
    				return coa;
    			}));
    		}
    	};

    	return [
    		w,
    		h,
    		coas,
    		font,
    		regenerate,
    		editCOA,
    		gallery,
    		$history,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { gallery: 6, w: 0, h: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*gallery*/ ctx[6] === undefined && !('gallery' in props)) {
    			console.warn("<Gallery> was created without expected prop 'gallery'");
    		}

    		if (/*w*/ ctx[0] === undefined && !('w' in props)) {
    			console.warn("<Gallery> was created without expected prop 'w'");
    		}

    		if (/*h*/ ctx[1] === undefined && !('h' in props)) {
    			console.warn("<Gallery> was created without expected prop 'h'");
    		}
    	}

    	get gallery() {
    		throw new Error("<Gallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gallery(value) {
    		throw new Error("<Gallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get w() {
    		throw new Error("<Gallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set w(value) {
    		throw new Error("<Gallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get h() {
    		throw new Error("<Gallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set h(value) {
    		throw new Error("<Gallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\navigation\LicenseList.svelte generated by Svelte v3.44.2 */

    const file$5 = "src\\components\\navigation\\LicenseList.svelte";

    function create_fragment$5(ctx) {
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let option7;
    	let option8;
    	let option9;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Unknown";
    			option1 = element("option");
    			option1.textContent = "Proprietary";
    			option2 = element("option");
    			option2.textContent = "Copyright Free";
    			option3 = element("option");
    			option3.textContent = "Public Domain";
    			option4 = element("option");
    			option4.textContent = "CC BY";
    			option5 = element("option");
    			option5.textContent = "CC BY-SA";
    			option6 = element("option");
    			option6.textContent = "CC BY-NC";
    			option7 = element("option");
    			option7.textContent = "CC BY-ND";
    			option8 = element("option");
    			option8.textContent = "CC BY-NC-SA";
    			option9 = element("option");
    			option9.textContent = "CC BY-NC-ND";
    			option0.__value = "Unknown";
    			option0.value = option0.__value;
    			option0.selected = true;
    			add_location(option0, file$5, 5, 2, 99);
    			option1.__value = "Proprietary";
    			option1.value = option1.__value;
    			add_location(option1, file$5, 6, 2, 152);
    			option2.__value = "Copyright Free";
    			option2.value = option2.__value;
    			add_location(option2, file$5, 7, 2, 204);
    			option3.__value = "https://creativecommons.org/publicdomain/zero/1.0";
    			option3.value = option3.__value;
    			add_location(option3, file$5, 8, 2, 262);
    			option4.__value = "https://creativecommons.org/licenses/by/4.0";
    			option4.value = option4.__value;
    			add_location(option4, file$5, 9, 2, 354);
    			option5.__value = "https://creativecommons.org/licenses/by-sa/4.0";
    			option5.value = option5.__value;
    			add_location(option5, file$5, 10, 2, 432);
    			option6.__value = "https://creativecommons.org/licenses/by-nc/4.0";
    			option6.value = option6.__value;
    			add_location(option6, file$5, 11, 2, 516);
    			option7.__value = "https://creativecommons.org/licenses/by-nd/4.0";
    			option7.value = option7.__value;
    			add_location(option7, file$5, 12, 2, 600);
    			option8.__value = "https://creativecommons.org/licenses/by-nc-sa/4.0";
    			option8.value = option8.__value;
    			add_location(option8, file$5, 13, 2, 684);
    			option9.__value = "https://creativecommons.org/licenses/by-nc-nd/4.0";
    			option9.value = option9.__value;
    			add_location(option9, file$5, 14, 2, 774);
    			set_style(select, "width", "10em");
    			if (/*license*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[1].call(select));
    			add_location(select, file$5, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			append_dev(select, option4);
    			append_dev(select, option5);
    			append_dev(select, option6);
    			append_dev(select, option7);
    			append_dev(select, option8);
    			append_dev(select, option9);
    			select_option(select, /*license*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*license*/ 1) {
    				select_option(select, /*license*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LicenseList', slots, []);
    	let { license } = $$props;
    	const writable_props = ['license'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LicenseList> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		license = select_value(this);
    		$$invalidate(0, license);
    	}

    	$$self.$$set = $$props => {
    		if ('license' in $$props) $$invalidate(0, license = $$props.license);
    	};

    	$$self.$capture_state = () => ({ license });

    	$$self.$inject_state = $$props => {
    		if ('license' in $$props) $$invalidate(0, license = $$props.license);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [license, select_change_handler];
    }

    class LicenseList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { license: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LicenseList",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*license*/ ctx[0] === undefined && !('license' in props)) {
    			console.warn("<LicenseList> was created without expected prop 'license'");
    		}
    	}

    	get license() {
    		throw new Error("<LicenseList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set license(value) {
    		throw new Error("<LicenseList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\navigation\UploadRaster.svelte generated by Svelte v3.44.2 */

    const { Object: Object_1$2 } = globals;
    const file$4 = "src\\components\\navigation\\UploadRaster.svelte";
    const get_default_slot_changes$1 = dirty => ({ dragging: dirty[0] & /*dragging*/ 2 });
    const get_default_slot_context$1 = ctx => ({ dragging: /*dragging*/ ctx[1] });

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	return child_ctx;
    }

    // (157:4) {:else}
    function create_else_block$3(ctx) {
    	let label;
    	let t;
    	let input;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], get_default_slot_context$1);
    	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t = space();
    			input = element("input");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", "image/*");
    			attr_dev(input, "class", "svelte-9vx5g7");
    			add_location(input, file$4, 161, 8, 5653);
    			attr_dev(label, "class", "dragging svelte-9vx5g7");
    			add_location(label, file$4, 157, 6, 5509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(label, null);
    			}

    			append_dev(label, t);
    			append_dev(label, input);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*onFile*/ ctx[13](getFilesFromInputEvent$1), false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope, dragging*/ 32770)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(157:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (98:4) {#if selected}
    function create_if_block$3(ctx) {
    	let svg;
    	let g;
    	let image;
    	let image_x_value;
    	let image_y_value;
    	let image_width_value;
    	let image_height_value;
    	let path;
    	let path_d_value;
    	let rect;
    	let t0;
    	let div17;
    	let div1;
    	let div0;
    	let t2;
    	let input0;
    	let t3;
    	let div3;
    	let div2;
    	let t5;
    	let input1;
    	let t6;
    	let div5;
    	let div4;
    	let t8;
    	let input2;
    	let t9;
    	let div7;
    	let div6;
    	let t11;
    	let input3;
    	let t12;
    	let div9;
    	let div8;
    	let t14;
    	let input4;
    	let t15;
    	let div11;
    	let div10;
    	let t17;
    	let licenselist;
    	let updating_license;
    	let t18;
    	let div13;
    	let div12;
    	let t20;
    	let input5;
    	let t21;
    	let div15;
    	let div14;
    	let t23;
    	let select;
    	let t24;
    	let div16;
    	let button0;
    	let t26;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;

    	function licenselist_license_binding(value) {
    		/*licenselist_license_binding*/ ctx[23](value);
    	}

    	let licenselist_props = {};

    	if (/*license*/ ctx[9] !== void 0) {
    		licenselist_props.license = /*license*/ ctx[9];
    	}

    	licenselist = new LicenseList({ props: licenselist_props, $$inline: true });
    	binding_callbacks.push(() => bind(licenselist, 'license', licenselist_license_binding));
    	let each_value = Object.keys(/*charges*/ ctx[0].types);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			image = svg_element("image");
    			path = svg_element("path");
    			rect = svg_element("rect");
    			t0 = space();
    			div17 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Size:";
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "Offset X:";
    			t5 = space();
    			input1 = element("input");
    			t6 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "Offset Y:";
    			t8 = space();
    			input2 = element("input");
    			t9 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "Source:";
    			t11 = space();
    			input3 = element("input");
    			t12 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div8.textContent = "Author:";
    			t14 = space();
    			input4 = element("input");
    			t15 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div10.textContent = "License:";
    			t17 = space();
    			create_component(licenselist.$$.fragment);
    			t18 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div12.textContent = "Name:";
    			t20 = space();
    			input5 = element("input");
    			t21 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div14.textContent = "Category:";
    			t23 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t24 = space();
    			div16 = element("div");
    			button0 = element("button");
    			button0.textContent = "Add";
    			t26 = space();
    			button1 = element("button");
    			button1.textContent = "Cancel";
    			attr_dev(image, "id", "imageLoaded");
    			attr_dev(image, "x", image_x_value = "" + ((100 - /*size*/ ctx[3]) / 2 + /*offsetX*/ ctx[4] + "%"));
    			attr_dev(image, "y", image_y_value = "" + ((100 - /*size*/ ctx[3]) / 2 + /*offsetY*/ ctx[5] + "%"));
    			attr_dev(image, "width", image_width_value = "" + (/*size*/ ctx[3] + "%"));
    			attr_dev(image, "height", image_height_value = "" + (/*size*/ ctx[3] + "%"));
    			add_location(image, file$4, 108, 10, 3455);
    			attr_dev(path, "d", path_d_value = shieldPaths[/*$shield*/ ctx[12]]);
    			add_location(path, file$4, 109, 10, 3594);
    			attr_dev(rect, "x", "60");
    			attr_dev(rect, "y", "60");
    			attr_dev(rect, "width", "80");
    			attr_dev(rect, "height", "80");
    			add_location(rect, file$4, 110, 10, 3639);
    			attr_dev(g, "fill", "#fff");
    			attr_dev(g, "fill-opacity", ".05");
    			attr_dev(g, "stroke", "#fff");
    			attr_dev(g, "stroke-width", ".5");
    			add_location(g, file$4, 107, 8, 3377);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "stroke", "#000");
    			attr_dev(svg, "stroke-width", "1");
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			attr_dev(svg, "data-tooltip", "Fit image into the rectangle for best result");
    			add_location(svg, file$4, 98, 6, 3139);
    			attr_dev(div0, "class", "label");
    			add_location(div0, file$4, 116, 10, 3819);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "class", "svelte-9vx5g7");
    			add_location(input0, file$4, 117, 10, 3861);
    			attr_dev(div1, "data-tooltip", "Image size in percents");
    			add_location(div1, file$4, 115, 8, 3752);
    			attr_dev(div2, "class", "label");
    			add_location(div2, file$4, 120, 10, 3999);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "svelte-9vx5g7");
    			add_location(input1, file$4, 121, 10, 4045);
    			attr_dev(div3, "data-tooltip", "Offset by X axis in pixels");
    			add_location(div3, file$4, 119, 8, 3928);
    			attr_dev(div4, "class", "label");
    			add_location(div4, file$4, 124, 10, 4186);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "class", "svelte-9vx5g7");
    			add_location(input2, file$4, 125, 10, 4232);
    			attr_dev(div5, "data-tooltip", "Offset by Y axis in pixels");
    			add_location(div5, file$4, 123, 8, 4115);
    			attr_dev(div6, "class", "label");
    			add_location(div6, file$4, 128, 10, 4371);
    			attr_dev(input3, "class", "svelte-9vx5g7");
    			add_location(input3, file$4, 129, 10, 4415);
    			attr_dev(div7, "data-tooltip", "Link to the image source");
    			add_location(div7, file$4, 127, 8, 4302);
    			attr_dev(div8, "class", "label");
    			add_location(div8, file$4, 132, 10, 4549);
    			attr_dev(input4, "class", "svelte-9vx5g7");
    			add_location(input4, file$4, 133, 10, 4593);
    			attr_dev(div9, "data-tooltip", "Image author or source portal name");
    			add_location(div9, file$4, 131, 8, 4470);
    			attr_dev(div10, "class", "label");
    			add_location(div10, file$4, 136, 10, 4706);
    			attr_dev(div11, "data-tooltip", "Image license");
    			add_location(div11, file$4, 135, 8, 4648);
    			attr_dev(div12, "class", "label");
    			add_location(div12, file$4, 140, 10, 4873);
    			attr_dev(input5, "placeholder", "Charge id");
    			input5.required = true;
    			attr_dev(input5, "class", "svelte-9vx5g7");
    			add_location(input5, file$4, 141, 10, 4915);
    			attr_dev(div13, "data-tooltip", "Charge unique name (id)");
    			add_location(div13, file$4, 139, 8, 4805);
    			attr_dev(div14, "class", "label");
    			add_location(div14, file$4, 144, 10, 5070);
    			attr_dev(select, "class", "svelte-9vx5g7");
    			if (/*category*/ ctx[7] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[25].call(select));
    			add_location(select, file$4, 145, 10, 5116);
    			attr_dev(div15, "data-tooltip", "Category to put a charge");
    			add_location(div15, file$4, 143, 8, 5001);
    			attr_dev(button0, "class", "svelte-9vx5g7");
    			add_location(button0, file$4, 152, 10, 5346);
    			attr_dev(button1, "class", "svelte-9vx5g7");
    			add_location(button1, file$4, 153, 10, 5399);
    			attr_dev(div16, "class", "buttons svelte-9vx5g7");
    			add_location(div16, file$4, 151, 8, 5313);
    			attr_dev(div17, "class", "inputs svelte-9vx5g7");
    			add_location(div17, file$4, 114, 6, 3722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, image);
    			append_dev(g, path);
    			append_dev(g, rect);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div17, anchor);
    			append_dev(div17, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t2);
    			append_dev(div1, input0);
    			set_input_value(input0, /*size*/ ctx[3]);
    			append_dev(div17, t3);
    			append_dev(div17, div3);
    			append_dev(div3, div2);
    			append_dev(div3, t5);
    			append_dev(div3, input1);
    			set_input_value(input1, /*offsetX*/ ctx[4]);
    			append_dev(div17, t6);
    			append_dev(div17, div5);
    			append_dev(div5, div4);
    			append_dev(div5, t8);
    			append_dev(div5, input2);
    			set_input_value(input2, /*offsetY*/ ctx[5]);
    			append_dev(div17, t9);
    			append_dev(div17, div7);
    			append_dev(div7, div6);
    			append_dev(div7, t11);
    			append_dev(div7, input3);
    			set_input_value(input3, /*source*/ ctx[8]);
    			append_dev(div17, t12);
    			append_dev(div17, div9);
    			append_dev(div9, div8);
    			append_dev(div9, t14);
    			append_dev(div9, input4);
    			set_input_value(input4, /*author*/ ctx[10]);
    			append_dev(div17, t15);
    			append_dev(div17, div11);
    			append_dev(div11, div10);
    			append_dev(div11, t17);
    			mount_component(licenselist, div11, null);
    			append_dev(div17, t18);
    			append_dev(div17, div13);
    			append_dev(div13, div12);
    			append_dev(div13, t20);
    			append_dev(div13, input5);
    			set_input_value(input5, /*name*/ ctx[6]);
    			append_dev(div17, t21);
    			append_dev(div17, div15);
    			append_dev(div15, div14);
    			append_dev(div15, t23);
    			append_dev(div15, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*category*/ ctx[7]);
    			append_dev(div17, t24);
    			append_dev(div17, div16);
    			append_dev(div16, button0);
    			append_dev(div16, t26);
    			append_dev(div16, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, svg)),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[18]),
    					action_destroyer(tooltip.call(null, div1)),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[19]),
    					action_destroyer(tooltip.call(null, div3)),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[20]),
    					action_destroyer(tooltip.call(null, div5)),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[21]),
    					action_destroyer(tooltip.call(null, div7)),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[22]),
    					action_destroyer(tooltip.call(null, div9)),
    					action_destroyer(tooltip.call(null, div11)),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[24]),
    					action_destroyer(tooltip.call(null, div13)),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[25]),
    					action_destroyer(tooltip.call(null, div15)),
    					listen_dev(button0, "click", /*addCharge*/ ctx[14], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[26], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*size, offsetX*/ 24 && image_x_value !== (image_x_value = "" + ((100 - /*size*/ ctx[3]) / 2 + /*offsetX*/ ctx[4] + "%"))) {
    				attr_dev(image, "x", image_x_value);
    			}

    			if (!current || dirty[0] & /*size, offsetY*/ 40 && image_y_value !== (image_y_value = "" + ((100 - /*size*/ ctx[3]) / 2 + /*offsetY*/ ctx[5] + "%"))) {
    				attr_dev(image, "y", image_y_value);
    			}

    			if (!current || dirty[0] & /*size*/ 8 && image_width_value !== (image_width_value = "" + (/*size*/ ctx[3] + "%"))) {
    				attr_dev(image, "width", image_width_value);
    			}

    			if (!current || dirty[0] & /*size*/ 8 && image_height_value !== (image_height_value = "" + (/*size*/ ctx[3] + "%"))) {
    				attr_dev(image, "height", image_height_value);
    			}

    			if (!current || dirty[0] & /*$shield*/ 4096 && path_d_value !== (path_d_value = shieldPaths[/*$shield*/ ctx[12]])) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty[0] & /*size*/ 8 && to_number(input0.value) !== /*size*/ ctx[3]) {
    				set_input_value(input0, /*size*/ ctx[3]);
    			}

    			if (dirty[0] & /*offsetX*/ 16 && to_number(input1.value) !== /*offsetX*/ ctx[4]) {
    				set_input_value(input1, /*offsetX*/ ctx[4]);
    			}

    			if (dirty[0] & /*offsetY*/ 32 && to_number(input2.value) !== /*offsetY*/ ctx[5]) {
    				set_input_value(input2, /*offsetY*/ ctx[5]);
    			}

    			if (dirty[0] & /*source*/ 256 && input3.value !== /*source*/ ctx[8]) {
    				set_input_value(input3, /*source*/ ctx[8]);
    			}

    			if (dirty[0] & /*author*/ 1024 && input4.value !== /*author*/ ctx[10]) {
    				set_input_value(input4, /*author*/ ctx[10]);
    			}

    			const licenselist_changes = {};

    			if (!updating_license && dirty[0] & /*license*/ 512) {
    				updating_license = true;
    				licenselist_changes.license = /*license*/ ctx[9];
    				add_flush_callback(() => updating_license = false);
    			}

    			licenselist.$set(licenselist_changes);

    			if (dirty[0] & /*name*/ 64 && input5.value !== /*name*/ ctx[6]) {
    				set_input_value(input5, /*name*/ ctx[6]);
    			}

    			if (dirty[0] & /*charges*/ 1) {
    				each_value = Object.keys(/*charges*/ ctx[0].types);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*category, charges*/ 129) {
    				select_option(select, /*category*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(licenselist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(licenselist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div17);
    			destroy_component(licenselist);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(98:4) {#if selected}",
    		ctx
    	});

    	return block;
    }

    // (159:25)             
    function fallback_block$1(ctx) {
    	let div;
    	let t0;
    	let b;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Drag & Drop image here or ");
    			b = element("b");
    			b.textContent = "browse";
    			add_location(b, file$4, 159, 45, 5607);
    			add_location(div, file$4, 159, 10, 5572);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, b);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(159:25)             ",
    		ctx
    	});

    	return block;
    }

    // (147:12) {#each Object.keys(charges.types) as c}
    function create_each_block$2(ctx) {
    	let option;
    	let t_value = /*c*/ ctx[30] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*c*/ ctx[30];
    			option.value = option.__value;
    			add_location(option, file$4, 147, 14, 5215);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*charges*/ 1 && t_value !== (t_value = /*c*/ ctx[30] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*charges*/ 1 && option_value_value !== (option_value_value = /*c*/ ctx[30])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(147:12) {#each Object.keys(charges.types) as c}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let span;
    	let t1;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selected*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "×";
    			t1 = space();
    			div0 = element("div");
    			if_block.c();
    			attr_dev(span, "class", "close svelte-9vx5g7");
    			add_location(span, file$4, 95, 2, 3013);
    			attr_dev(div0, "class", "container svelte-9vx5g7");
    			add_location(div0, file$4, 96, 2, 3088);
    			attr_dev(div1, "id", "rasterUpload");
    			attr_dev(div1, "class", "svelte-9vx5g7");
    			add_location(div1, file$4, 89, 0, 2809);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "click", /*click_handler*/ ctx[17], false, false, false),
    					listen_dev(div1, "drop", prevent_default(/*onFile*/ ctx[13](getFilesFromDropEvent$1)), false, true, false),
    					listen_dev(div1, "dragover", prevent_default(/*dragover_handler*/ ctx[27]), false, true, false),
    					listen_dev(div1, "dragleave", prevent_default(/*dragleave_handler*/ ctx[28]), false, true, false)
    				];

    				mounted = true;
    			}
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
    				if_block.m(div0, null);
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
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
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

    function getFilesFromDropEvent$1({ dataTransfer: { files, items } }) {
    	return files.length
    	? [...files]
    	: items.filter(({ kind }) => kind === "file").map(({ getAsFile }) => getAsFile());
    }

    function getFilesFromInputEvent$1({ target }) {
    	const files = target.files ? [...target.files] : [];
    	target.value = "";
    	return files;
    }

    function loadImage(file) {
    	const reader = new FileReader();

    	reader.onload = function (readerEvent) {
    		const dataURL = readerEvent.target.result;
    		const image = document.getElementById("rasterUpload").querySelector("svg image");
    		image.setAttribute("href", dataURL);
    	};

    	reader.readAsDataURL(file);
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $message;
    	let $state;
    	let $shield;
    	validate_store(message, 'message');
    	component_subscribe($$self, message, $$value => $$invalidate(29, $message = $$value));
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(11, $state = $$value));
    	validate_store(shield, 'shield');
    	component_subscribe($$self, shield, $$value => $$invalidate(12, $shield = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UploadRaster', slots, ['default']);
    	let dragging = false, selected = false;
    	let size = 50, offsetX = 0, offsetY = 0;
    	let name, category = "uploaded", source, license, author;

    	const onFile = getFilesFunction => event => {
    		$$invalidate(1, dragging = false);
    		const files = getFilesFunction(event);
    		const file = files.length ? files[0] : [];

    		if (!file.type.match(/image.*/)) {
    			set_store_value(
    				message,
    				$message = {
    					type: "error",
    					text: "Not an image file!"
    				},
    				$message
    			);

    			return;
    		}

    		$$invalidate(2, selected = true);

    		set_store_value(
    			message,
    			$message = {
    				type: "info",
    				text: "Fit image into the rectangle for best result"
    			},
    			$message
    		);

    		$$invalidate(6, name = camelize(file.name));
    		loadImage(file);
    	};

    	function addCharge() {
    		const allCharges = Object.keys(charges.types).map(type => Object.keys(charges[type])).flat();
    		$$invalidate(6, name = camelize(name));

    		if (!name || document.getElementById(name) || allCharges.includes(name)) {
    			set_store_value(
    				message,
    				$message = {
    					type: "error",
    					text: "Name must be unique id!"
    				},
    				$message
    			);

    			return;
    		}

    		if (!charges.types[category]) $$invalidate(0, charges.types[category] = 6, charges);
    		if (!charges.single[category]) $$invalidate(0, charges.single[category] = 6, charges);
    		$$invalidate(0, charges[category][name] = 5, charges);

    		// remove stored weighted arrays
    		delete charges.types.array;

    		delete charges.single.array;
    		delete charges[category].array;
    		const image = document.getElementById("rasterUpload").querySelector("svg image").cloneNode(true);
    		image.id = name;
    		if (source) image.setAttribute("source", source);
    		if (license) image.setAttribute("license", license);
    		if (author) image.setAttribute("author", author);
    		document.getElementById("charges").appendChild(image);
    		$$invalidate(2, selected = false);
    		set_store_value(state, $state.raster = 0, $state);

    		set_store_value(
    			message,
    			$message = {
    				type: "success",
    				text: `Charge "${name}" is added to the category "${category}"`
    			},
    			$message
    		);
    	}

    	const writable_props = [];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UploadRaster> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => set_store_value(state, $state.raster = 0, $state);

    	function input0_input_handler() {
    		size = to_number(this.value);
    		$$invalidate(3, size);
    	}

    	function input1_input_handler() {
    		offsetX = to_number(this.value);
    		$$invalidate(4, offsetX);
    	}

    	function input2_input_handler() {
    		offsetY = to_number(this.value);
    		$$invalidate(5, offsetY);
    	}

    	function input3_input_handler() {
    		source = this.value;
    		$$invalidate(8, source);
    	}

    	function input4_input_handler() {
    		author = this.value;
    		$$invalidate(10, author);
    	}

    	function licenselist_license_binding(value) {
    		license = value;
    		$$invalidate(9, license);
    	}

    	function input5_input_handler() {
    		name = this.value;
    		$$invalidate(6, name);
    	}

    	function select_change_handler() {
    		category = select_value(this);
    		$$invalidate(7, category);
    		$$invalidate(0, charges);
    	}

    	const click_handler_1 = () => $$invalidate(2, selected = false);
    	const dragover_handler = () => $$invalidate(1, dragging = true);
    	const dragleave_handler = () => $$invalidate(1, dragging = false);

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(15, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		LicenseList,
    		state,
    		message,
    		shield,
    		charges,
    		shieldPaths,
    		tooltip,
    		camelize,
    		dragging,
    		selected,
    		size,
    		offsetX,
    		offsetY,
    		name,
    		category,
    		source,
    		license,
    		author,
    		onFile,
    		getFilesFromDropEvent: getFilesFromDropEvent$1,
    		getFilesFromInputEvent: getFilesFromInputEvent$1,
    		loadImage,
    		addCharge,
    		$message,
    		$state,
    		$shield
    	});

    	$$self.$inject_state = $$props => {
    		if ('dragging' in $$props) $$invalidate(1, dragging = $$props.dragging);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    		if ('offsetX' in $$props) $$invalidate(4, offsetX = $$props.offsetX);
    		if ('offsetY' in $$props) $$invalidate(5, offsetY = $$props.offsetY);
    		if ('name' in $$props) $$invalidate(6, name = $$props.name);
    		if ('category' in $$props) $$invalidate(7, category = $$props.category);
    		if ('source' in $$props) $$invalidate(8, source = $$props.source);
    		if ('license' in $$props) $$invalidate(9, license = $$props.license);
    		if ('author' in $$props) $$invalidate(10, author = $$props.author);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		charges,
    		dragging,
    		selected,
    		size,
    		offsetX,
    		offsetY,
    		name,
    		category,
    		source,
    		license,
    		author,
    		$state,
    		$shield,
    		onFile,
    		addCharge,
    		$$scope,
    		slots,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		licenselist_license_binding,
    		input5_input_handler,
    		select_change_handler,
    		click_handler_1,
    		dragover_handler,
    		dragleave_handler
    	];
    }

    class UploadRaster extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UploadRaster",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\navigation\UploadVector.svelte generated by Svelte v3.44.2 */

    const { Object: Object_1$1 } = globals;
    const file$3 = "src\\components\\navigation\\UploadVector.svelte";
    const get_default_slot_changes = dirty => ({ dragging: dirty[0] & /*dragging*/ 4 });
    const get_default_slot_context = ctx => ({ dragging: /*dragging*/ ctx[2] });

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    // (220:4) {:else}
    function create_else_block$2(ctx) {
    	let label;
    	let t0;
    	let input;
    	let t1;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], get_default_slot_context);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t0 = space();
    			input = element("input");
    			t1 = space();
    			button = element("button");
    			button.textContent = "Download Template";
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", ".svg");
    			attr_dev(input, "class", "svelte-zayoyo");
    			add_location(input, file$3, 224, 8, 7865);
    			attr_dev(label, "class", "dragging svelte-zayoyo");
    			add_location(label, file$3, 220, 6, 7718);
    			attr_dev(button, "class", "template svelte-zayoyo");
    			add_location(button, file$3, 226, 6, 7966);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(label, null);
    			}

    			append_dev(label, t0);
    			append_dev(label, input);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*onFile*/ ctx[15](getFilesFromInputEvent), false, false, false),
    					listen_dev(button, "click", downloadTemplate, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope, dragging*/ 131076)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[17],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[17])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[17], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(220:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (142:4) {#if selected}
    function create_if_block$2(ctx) {
    	let svg_1;
    	let g0;
    	let path;
    	let path_d_value;
    	let rect;
    	let g1;
    	let t0;
    	let div1;
    	let div0;
    	let t2;
    	let textarea;
    	let t3;
    	let div19;
    	let div3;
    	let div2;
    	let t5;
    	let input0;
    	let t6;
    	let input1;
    	let t7;
    	let div5;
    	let div4;
    	let t9;
    	let input2;
    	let t10;
    	let input3;
    	let t11;
    	let div7;
    	let div6;
    	let t13;
    	let select0;
    	let t14;
    	let div9;
    	let div8;
    	let t16;
    	let input4;
    	let t17;
    	let div11;
    	let div10;
    	let t19;
    	let input5;
    	let t20;
    	let div13;
    	let div12;
    	let t22;
    	let licenselist;
    	let updating_license;
    	let t23;
    	let div15;
    	let div14;
    	let t25;
    	let input6;
    	let t26;
    	let div17;
    	let div16;
    	let t28;
    	let select1;
    	let t29;
    	let div18;
    	let button0;
    	let t31;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*tinctureList*/ ctx[14];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function licenselist_license_binding(value) {
    		/*licenselist_license_binding*/ ctx[28](value);
    	}

    	let licenselist_props = {};

    	if (/*license*/ ctx[9] !== void 0) {
    		licenselist_props.license = /*license*/ ctx[9];
    	}

    	licenselist = new LicenseList({ props: licenselist_props, $$inline: true });
    	binding_callbacks.push(() => bind(licenselist, 'license', licenselist_license_binding));
    	let each_value = Object.keys(/*charges*/ ctx[1].types);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			svg_1 = svg_element("svg");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			rect = svg_element("rect");
    			g1 = svg_element("g");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "SVG Markup:";
    			t2 = space();
    			textarea = element("textarea");
    			t3 = space();
    			div19 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "Translate:";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "Scale:";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			input3 = element("input");
    			t11 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "Tincture:";
    			t13 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t14 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div8.textContent = "Source:";
    			t16 = space();
    			input4 = element("input");
    			t17 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div10.textContent = "Author:";
    			t19 = space();
    			input5 = element("input");
    			t20 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div12.textContent = "License:";
    			t22 = space();
    			create_component(licenselist.$$.fragment);
    			t23 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div14.textContent = "Name:";
    			t25 = space();
    			input6 = element("input");
    			t26 = space();
    			div17 = element("div");
    			div16 = element("div");
    			div16.textContent = "Category:";
    			t28 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t29 = space();
    			div18 = element("div");
    			button0 = element("button");
    			button0.textContent = "Upload";
    			t31 = space();
    			button1 = element("button");
    			button1.textContent = "Cancel";
    			attr_dev(path, "d", path_d_value = shieldPaths[/*$shield*/ ctx[12]]);
    			add_location(path, file$3, 153, 10, 5082);
    			attr_dev(rect, "x", "60");
    			attr_dev(rect, "y", "60");
    			attr_dev(rect, "width", "80");
    			attr_dev(rect, "height", "80");
    			add_location(rect, file$3, 154, 10, 5127);
    			attr_dev(g0, "fill", "#fff");
    			attr_dev(g0, "fill-opacity", ".05");
    			attr_dev(g0, "stroke", "#fff");
    			attr_dev(g0, "stroke-width", ".5");
    			add_location(g0, file$3, 152, 8, 5004);
    			add_location(g1, file$3, 156, 8, 5196);
    			attr_dev(svg_1, "width", "100%");
    			attr_dev(svg_1, "height", "100%");
    			attr_dev(svg_1, "fill", /*color*/ ctx[7]);
    			attr_dev(svg_1, "stroke", "#000");
    			attr_dev(svg_1, "stroke-width", "1");
    			attr_dev(svg_1, "viewBox", "0 0 200 200");
    			attr_dev(svg_1, "data-tooltip", "Fit image into the rectangle for best result");
    			add_location(svg_1, file$3, 142, 6, 4744);
    			attr_dev(div0, "class", "label");
    			add_location(div0, file$3, 160, 8, 5253);
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "class", "svelte-zayoyo");
    			add_location(textarea, file$3, 161, 8, 5299);
    			add_location(div1, file$3, 159, 6, 5238);
    			attr_dev(div2, "class", "label");
    			add_location(div2, file$3, 166, 10, 5464);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "step", ".1");
    			attr_dev(input0, "class", "paired svelte-zayoyo");
    			add_location(input0, file$3, 167, 10, 5511);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "step", ".1");
    			attr_dev(input1, "class", "paired svelte-zayoyo");
    			add_location(input1, file$3, 168, 10, 5596);
    			attr_dev(div3, "data-tooltip", "Charge translate: X and Y px");
    			add_location(div3, file$3, 165, 8, 5391);
    			attr_dev(div4, "class", "label");
    			add_location(div4, file$3, 172, 10, 5788);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "step", ".01");
    			attr_dev(input2, "class", "paired svelte-zayoyo");
    			add_location(input2, file$3, 173, 10, 5831);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "step", ".01");
    			attr_dev(input3, "class", "paired svelte-zayoyo");
    			add_location(input3, file$3, 174, 10, 5917);
    			attr_dev(div5, "data-tooltip", "Charge scale: X and Y, where 1 is default size");
    			add_location(div5, file$3, 171, 8, 5697);
    			attr_dev(div6, "class", "label");
    			add_location(div6, file$3, 181, 10, 6248);
    			attr_dev(select0, "class", "svelte-zayoyo");
    			if (/*color*/ ctx[7] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[25].call(select0));
    			add_location(select0, file$3, 182, 10, 6294);
    			attr_dev(div7, "data-tooltip", "Tincture preview color, does not affect uploaded actual color. Charges must not have exact color defined. In this case charge will support all tunctures");
    			add_location(div7, file$3, 177, 8, 6019);
    			attr_dev(div8, "class", "label");
    			add_location(div8, file$3, 190, 10, 6575);
    			attr_dev(input4, "class", "svelte-zayoyo");
    			add_location(input4, file$3, 191, 10, 6619);
    			attr_dev(div9, "data-tooltip", "Link to the image source");
    			add_location(div9, file$3, 189, 8, 6506);
    			attr_dev(div10, "class", "label");
    			add_location(div10, file$3, 194, 10, 6753);
    			attr_dev(input5, "class", "svelte-zayoyo");
    			add_location(input5, file$3, 195, 10, 6797);
    			attr_dev(div11, "data-tooltip", "Image author or source portal name");
    			add_location(div11, file$3, 193, 8, 6674);
    			attr_dev(div12, "class", "label");
    			add_location(div12, file$3, 198, 10, 6910);
    			attr_dev(div13, "data-tooltip", "Image license");
    			add_location(div13, file$3, 197, 8, 6852);
    			attr_dev(div14, "class", "label");
    			add_location(div14, file$3, 202, 10, 7077);
    			attr_dev(input6, "placeholder", "Charge id");
    			input6.required = true;
    			attr_dev(input6, "class", "svelte-zayoyo");
    			add_location(input6, file$3, 203, 10, 7119);
    			attr_dev(div15, "data-tooltip", "Charge unique name (id)");
    			add_location(div15, file$3, 201, 8, 7009);
    			attr_dev(div16, "class", "label");
    			add_location(div16, file$3, 206, 10, 7274);
    			attr_dev(select1, "class", "svelte-zayoyo");
    			if (/*category*/ ctx[6] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[30].call(select1));
    			add_location(select1, file$3, 207, 10, 7320);
    			attr_dev(div17, "data-tooltip", "Category to put a charge");
    			add_location(div17, file$3, 205, 8, 7205);
    			attr_dev(button0, "class", "svelte-zayoyo");
    			add_location(button0, file$3, 215, 10, 7552);
    			attr_dev(button1, "class", "svelte-zayoyo");
    			add_location(button1, file$3, 216, 10, 7608);
    			attr_dev(div18, "class", "buttons svelte-zayoyo");
    			add_location(div18, file$3, 214, 8, 7519);
    			attr_dev(div19, "class", "inputs svelte-zayoyo");
    			add_location(div19, file$3, 164, 6, 5361);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg_1, anchor);
    			append_dev(svg_1, g0);
    			append_dev(g0, path);
    			append_dev(g0, rect);
    			append_dev(svg_1, g1);
    			g1.innerHTML = /*svg*/ ctx[4];
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t2);
    			append_dev(div1, textarea);
    			set_input_value(textarea, /*svg*/ ctx[4]);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div19, anchor);
    			append_dev(div19, div3);
    			append_dev(div3, div2);
    			append_dev(div3, t5);
    			append_dev(div3, input0);
    			set_input_value(input0, /*transform*/ ctx[0].e);
    			append_dev(div3, t6);
    			append_dev(div3, input1);
    			set_input_value(input1, /*transform*/ ctx[0].f);
    			append_dev(div19, t7);
    			append_dev(div19, div5);
    			append_dev(div5, div4);
    			append_dev(div5, t9);
    			append_dev(div5, input2);
    			set_input_value(input2, /*transform*/ ctx[0].a);
    			append_dev(div5, t10);
    			append_dev(div5, input3);
    			set_input_value(input3, /*transform*/ ctx[0].d);
    			append_dev(div19, t11);
    			append_dev(div19, div7);
    			append_dev(div7, div6);
    			append_dev(div7, t13);
    			append_dev(div7, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*color*/ ctx[7]);
    			append_dev(div19, t14);
    			append_dev(div19, div9);
    			append_dev(div9, div8);
    			append_dev(div9, t16);
    			append_dev(div9, input4);
    			set_input_value(input4, /*source*/ ctx[8]);
    			append_dev(div19, t17);
    			append_dev(div19, div11);
    			append_dev(div11, div10);
    			append_dev(div11, t19);
    			append_dev(div11, input5);
    			set_input_value(input5, /*author*/ ctx[10]);
    			append_dev(div19, t20);
    			append_dev(div19, div13);
    			append_dev(div13, div12);
    			append_dev(div13, t22);
    			mount_component(licenselist, div13, null);
    			append_dev(div19, t23);
    			append_dev(div19, div15);
    			append_dev(div15, div14);
    			append_dev(div15, t25);
    			append_dev(div15, input6);
    			set_input_value(input6, /*name*/ ctx[5]);
    			append_dev(div19, t26);
    			append_dev(div19, div17);
    			append_dev(div17, div16);
    			append_dev(div17, t28);
    			append_dev(div17, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*category*/ ctx[6]);
    			append_dev(div19, t29);
    			append_dev(div19, div18);
    			append_dev(div18, button0);
    			append_dev(div18, t31);
    			append_dev(div18, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, svg_1)),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[20]),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[21]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[22]),
    					action_destroyer(tooltip.call(null, div3)),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[23]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[24]),
    					action_destroyer(tooltip.call(null, div5)),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[25]),
    					action_destroyer(tooltip.call(null, div7)),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[26]),
    					action_destroyer(tooltip.call(null, div9)),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[27]),
    					action_destroyer(tooltip.call(null, div11)),
    					action_destroyer(tooltip.call(null, div13)),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[29]),
    					action_destroyer(tooltip.call(null, div15)),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[30]),
    					action_destroyer(tooltip.call(null, div17)),
    					listen_dev(button0, "click", /*addCharge*/ ctx[16], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[31], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*$shield*/ 4096 && path_d_value !== (path_d_value = shieldPaths[/*$shield*/ ctx[12]])) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (!current || dirty[0] & /*svg*/ 16) g1.innerHTML = /*svg*/ ctx[4];
    			if (!current || dirty[0] & /*color, $colors, tinctureList*/ 24704) {
    				attr_dev(svg_1, "fill", /*color*/ ctx[7]);
    			}

    			if (dirty[0] & /*svg*/ 16) {
    				set_input_value(textarea, /*svg*/ ctx[4]);
    			}

    			if (dirty[0] & /*transform*/ 1 && to_number(input0.value) !== /*transform*/ ctx[0].e) {
    				set_input_value(input0, /*transform*/ ctx[0].e);
    			}

    			if (dirty[0] & /*transform*/ 1 && to_number(input1.value) !== /*transform*/ ctx[0].f) {
    				set_input_value(input1, /*transform*/ ctx[0].f);
    			}

    			if (dirty[0] & /*transform*/ 1 && to_number(input2.value) !== /*transform*/ ctx[0].a) {
    				set_input_value(input2, /*transform*/ ctx[0].a);
    			}

    			if (dirty[0] & /*transform*/ 1 && to_number(input3.value) !== /*transform*/ ctx[0].d) {
    				set_input_value(input3, /*transform*/ ctx[0].d);
    			}

    			if (dirty[0] & /*$colors, tinctureList*/ 24576) {
    				each_value_1 = /*tinctureList*/ ctx[14];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*color, $colors, tinctureList*/ 24704) {
    				select_option(select0, /*color*/ ctx[7]);
    			}

    			if (dirty[0] & /*source*/ 256 && input4.value !== /*source*/ ctx[8]) {
    				set_input_value(input4, /*source*/ ctx[8]);
    			}

    			if (dirty[0] & /*author*/ 1024 && input5.value !== /*author*/ ctx[10]) {
    				set_input_value(input5, /*author*/ ctx[10]);
    			}

    			const licenselist_changes = {};

    			if (!updating_license && dirty[0] & /*license*/ 512) {
    				updating_license = true;
    				licenselist_changes.license = /*license*/ ctx[9];
    				add_flush_callback(() => updating_license = false);
    			}

    			licenselist.$set(licenselist_changes);

    			if (dirty[0] & /*name*/ 32 && input6.value !== /*name*/ ctx[5]) {
    				set_input_value(input6, /*name*/ ctx[5]);
    			}

    			if (dirty[0] & /*charges*/ 2) {
    				each_value = Object.keys(/*charges*/ ctx[1].types);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*category, charges*/ 66) {
    				select_option(select1, /*category*/ ctx[6]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(licenselist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(licenselist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg_1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div19);
    			destroy_each(each_blocks_1, detaching);
    			destroy_component(licenselist);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(142:4) {#if selected}",
    		ctx
    	});

    	return block;
    }

    // (222:25)             
    function fallback_block(ctx) {
    	let div;
    	let t0;
    	let b;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Drag & Drop svg file here or ");
    			b = element("b");
    			b.textContent = "browse";
    			add_location(b, file$3, 222, 48, 7819);
    			add_location(div, file$3, 222, 10, 7781);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, b);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(222:25)             ",
    		ctx
    	});

    	return block;
    }

    // (184:12) {#each tinctureList as tincture}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*tincture*/ ctx[41] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*$colors*/ ctx[13][/*tincture*/ ctx[41]];
    			option.value = option.__value;
    			add_location(option, file$3, 184, 14, 6383);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$colors*/ 8192 && option_value_value !== (option_value_value = /*$colors*/ ctx[13][/*tincture*/ ctx[41]])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(184:12) {#each tinctureList as tincture}",
    		ctx
    	});

    	return block;
    }

    // (209:12) {#each Object.keys(charges.types) as c}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*c*/ ctx[38] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*c*/ ctx[38];
    			option.value = option.__value;
    			add_location(option, file$3, 209, 14, 7419);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*charges*/ 2 && t_value !== (t_value = /*c*/ ctx[38] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*charges*/ 2 && option_value_value !== (option_value_value = /*c*/ ctx[38])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(209:12) {#each Object.keys(charges.types) as c}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let span;
    	let t1;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selected*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "×";
    			t1 = space();
    			div0 = element("div");
    			if_block.c();
    			attr_dev(span, "class", "close svelte-zayoyo");
    			add_location(span, file$3, 139, 2, 4618);
    			attr_dev(div0, "class", "container svelte-zayoyo");
    			add_location(div0, file$3, 140, 2, 4693);
    			attr_dev(div1, "id", "vectorUpload");
    			attr_dev(div1, "class", "svelte-zayoyo");
    			add_location(div1, file$3, 133, 0, 4414);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "click", /*click_handler*/ ctx[19], false, false, false),
    					listen_dev(div1, "drop", prevent_default(/*onFile*/ ctx[15](getFilesFromDropEvent)), false, true, false),
    					listen_dev(div1, "dragover", prevent_default(/*dragover_handler*/ ctx[32]), false, true, false),
    					listen_dev(div1, "dragleave", prevent_default(/*dragleave_handler*/ ctx[33]), false, true, false)
    				];

    				mounted = true;
    			}
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
    				if_block.m(div0, null);
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
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
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

    function getFilesFromDropEvent({ dataTransfer: { files, items } }) {
    	return files.length
    	? [...files]
    	: items.filter(({ kind }) => kind === "file").map(({ getAsFile }) => getAsFile());
    }

    function getFilesFromInputEvent({ target }) {
    	const files = target.files ? [...target.files] : [];
    	target.value = "";
    	return files;
    }

    function downloadTemplate() {
    	fetch("charges/template.svg").then(text => {
    		return text.blob().then(blob => {
    			const a = document.createElement("a");
    			a.href = URL.createObjectURL(blob);
    			a.setAttribute("download", "armoriaChargeTemplate.txt");
    			a.click();
    		});
    	});
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $message;
    	let $state;
    	let $tinctures;
    	let $shield;
    	let $colors;
    	validate_store(message, 'message');
    	component_subscribe($$self, message, $$value => $$invalidate(34, $message = $$value));
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(11, $state = $$value));
    	validate_store(tinctures, 'tinctures');
    	component_subscribe($$self, tinctures, $$value => $$invalidate(35, $tinctures = $$value));
    	validate_store(shield, 'shield');
    	component_subscribe($$self, shield, $$value => $$invalidate(12, $shield = $$value));
    	validate_store(colors, 'colors');
    	component_subscribe($$self, colors, $$value => $$invalidate(13, $colors = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UploadVector', slots, ['default']);
    	let dragging = false, selected = false;

    	let svg,
    		transform = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    		name,
    		category = "uploaded",
    		color = "#d7374a";

    	let source, license, author;
    	const tinctureList = ["metals", "colours", "stains"].map(type => Object.keys($tinctures[type])).flat();

    	function updateTransform(transform) {
    		if (!svg) return; // on component on load
    		const el = document.createElement("html");
    		el.innerHTML = svg;
    		const g = el.querySelector("g");
    		const transformString = Object.values(transform).join(" ");
    		if (transformString === "1 0 0 1 0 0") g.removeAttribute("transform"); else g.setAttribute("transform", "matrix(" + transformString + ")");
    		$$invalidate(4, svg = g.outerHTML);
    	}

    	const onFile = getFilesFunction => event => {
    		$$invalidate(2, dragging = false);
    		const files = getFilesFunction(event);
    		const file = files.length ? files[0] : [];

    		if (!file.type.match(/text.*|svg.*/)) {
    			set_store_value(
    				message,
    				$message = {
    					type: "error",
    					text: "File must be text or svg!"
    				},
    				$message
    			);

    			return;
    		}

    		$$invalidate(3, selected = true);
    		$$invalidate(5, name = camelize(file.name));
    		loadImage(file);
    	};

    	function loadImage(file) {
    		const reader = new FileReader();

    		reader.onload = function (readerEvent) {
    			const svgText = readerEvent.target.result;
    			const el = document.createElement("html");
    			el.innerHTML = svgText;

    			// remove sodipodi and inkscape attributes
    			el.querySelectorAll("*").forEach(el => {
    				const attributes = el.getAttributeNames();

    				attributes.forEach(attr => {
    					if (attr.includes("inkscape") || attr.includes("sodipodi")) el.removeAttribute(attr);
    				});
    			});

    			const g = el.querySelector("g");

    			if (!g) {
    				set_store_value(
    					message,
    					$message = {
    						type: "error",
    						text: "File must be prepared svg. Download template for guidance!"
    					},
    					$message
    				);

    				$$invalidate(3, selected = false);
    				return;
    			}

    			const consolidated = g.transform.baseVal.consolidate();

    			if (consolidated) {
    				const { a, b, c, d, e, f } = consolidated.matrix;
    				const fix = n => +n.toFixed(4);

    				$$invalidate(0, transform = Object.assign(transform, {
    					a: fix(a),
    					b: fix(b),
    					c: fix(c),
    					d: fix(d),
    					e: fix(e),
    					f: fix(f)
    				}));
    			}

    			g.removeAttribute("id");
    			$$invalidate(4, svg = g.outerHTML);
    		};

    		reader.readAsText(file);
    	}

    	function addCharge() {
    		const allCharges = Object.keys(charges.types).map(type => Object.keys(charges[type])).flat();
    		$$invalidate(5, name = camelize(name));

    		if (!name || document.getElementById(name) || allCharges.includes(name)) {
    			set_store_value(
    				message,
    				$message = {
    					type: "error",
    					text: "Name must be unique id!"
    				},
    				$message
    			);

    			return;
    		}

    		if (!charges.types[category]) $$invalidate(1, charges.types[category] = 6, charges);
    		if (!charges.single[category]) $$invalidate(1, charges.single[category] = 6, charges);
    		$$invalidate(1, charges[category][name] = 5, charges);
    		const el = document.createElement("html");
    		el.innerHTML = svg;
    		const image = el.querySelector("g");
    		image.id = name;
    		if (source) image.setAttribute("source", source);
    		if (license) image.setAttribute("license", license);
    		if (author) image.setAttribute("author", author);
    		defs.insertAdjacentHTML("beforeend", image.outerHTML);
    		$$invalidate(3, selected = false);
    		set_store_value(state, $state.vector = 0, $state);

    		set_store_value(
    			message,
    			$message = {
    				type: "success",
    				text: `Charge "${name}" is added to the category "${category}"`
    			},
    			$message
    		);
    	}

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UploadVector> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => set_store_value(state, $state.vector = 0, $state);

    	function textarea_input_handler() {
    		svg = this.value;
    		$$invalidate(4, svg);
    	}

    	function input0_input_handler() {
    		transform.e = to_number(this.value);
    		$$invalidate(0, transform);
    	}

    	function input1_input_handler() {
    		transform.f = to_number(this.value);
    		$$invalidate(0, transform);
    	}

    	function input2_input_handler() {
    		transform.a = to_number(this.value);
    		$$invalidate(0, transform);
    	}

    	function input3_input_handler() {
    		transform.d = to_number(this.value);
    		$$invalidate(0, transform);
    	}

    	function select0_change_handler() {
    		color = select_value(this);
    		$$invalidate(7, color);
    		$$invalidate(14, tinctureList);
    	}

    	function input4_input_handler() {
    		source = this.value;
    		$$invalidate(8, source);
    	}

    	function input5_input_handler() {
    		author = this.value;
    		$$invalidate(10, author);
    	}

    	function licenselist_license_binding(value) {
    		license = value;
    		$$invalidate(9, license);
    	}

    	function input6_input_handler() {
    		name = this.value;
    		$$invalidate(5, name);
    	}

    	function select1_change_handler() {
    		category = select_value(this);
    		$$invalidate(6, category);
    		$$invalidate(1, charges);
    	}

    	const click_handler_1 = () => $$invalidate(3, selected = false);
    	const dragover_handler = () => $$invalidate(2, dragging = true);
    	const dragleave_handler = () => $$invalidate(2, dragging = false);

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(17, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		LicenseList,
    		state,
    		colors,
    		tinctures,
    		message,
    		shield,
    		charges,
    		shieldPaths,
    		camelize,
    		tooltip,
    		dragging,
    		selected,
    		svg,
    		transform,
    		name,
    		category,
    		color,
    		source,
    		license,
    		author,
    		tinctureList,
    		updateTransform,
    		onFile,
    		getFilesFromDropEvent,
    		getFilesFromInputEvent,
    		loadImage,
    		addCharge,
    		downloadTemplate,
    		$message,
    		$state,
    		$tinctures,
    		$shield,
    		$colors
    	});

    	$$self.$inject_state = $$props => {
    		if ('dragging' in $$props) $$invalidate(2, dragging = $$props.dragging);
    		if ('selected' in $$props) $$invalidate(3, selected = $$props.selected);
    		if ('svg' in $$props) $$invalidate(4, svg = $$props.svg);
    		if ('transform' in $$props) $$invalidate(0, transform = $$props.transform);
    		if ('name' in $$props) $$invalidate(5, name = $$props.name);
    		if ('category' in $$props) $$invalidate(6, category = $$props.category);
    		if ('color' in $$props) $$invalidate(7, color = $$props.color);
    		if ('source' in $$props) $$invalidate(8, source = $$props.source);
    		if ('license' in $$props) $$invalidate(9, license = $$props.license);
    		if ('author' in $$props) $$invalidate(10, author = $$props.author);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*transform*/ 1) {
    			updateTransform(transform);
    		}
    	};

    	return [
    		transform,
    		charges,
    		dragging,
    		selected,
    		svg,
    		name,
    		category,
    		color,
    		source,
    		license,
    		author,
    		$state,
    		$shield,
    		$colors,
    		tinctureList,
    		onFile,
    		addCharge,
    		$$scope,
    		slots,
    		click_handler,
    		textarea_input_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		select0_change_handler,
    		input4_input_handler,
    		input5_input_handler,
    		licenselist_license_binding,
    		input6_input_handler,
    		select1_change_handler,
    		click_handler_1,
    		dragover_handler,
    		dragleave_handler
    	];
    }

    class UploadVector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UploadVector",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    /* src\components\navigation\Tinctures.svelte generated by Svelte v3.44.2 */

    const { Object: Object_1 } = globals;
    const file$2 = "src\\components\\navigation\\Tinctures.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	child_ctx[37] = list;
    	child_ctx[38] = i;
    	return child_ctx;
    }

    // (131:8) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Add Tincture";
    			attr_dev(button, "class", "svelte-12bm0ds");
    			add_location(button, file$2, 131, 10, 4717);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addTincture*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(131:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (129:8) {#if add.show}
    function create_if_block_2$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Apply Tincture";
    			attr_dev(button, "class", "svelte-12bm0ds");
    			add_location(button, file$2, 129, 10, 4629);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*applyAddTincture*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(129:8) {#if add.show}",
    		ctx
    	});

    	return block;
    }

    // (150:10) {#if add.show}
    function create_if_block_1$1(ctx) {
    	let tr;
    	let td0;
    	let input0;
    	let t0;
    	let td1;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t4;
    	let td2;
    	let input1;
    	let t5;
    	let td3;
    	let input2;
    	let t6;
    	let td4;
    	let span;
    	let tr_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t0 = space();
    			td1 = element("td");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Metals";
    			option1 = element("option");
    			option1.textContent = "Colours";
    			option2 = element("option");
    			option2.textContent = "Stains";
    			t4 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t5 = space();
    			td3 = element("td");
    			input2 = element("input");
    			t6 = space();
    			td4 = element("td");
    			span = element("span");
    			span.textContent = "×";
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Tincture");
    			attr_dev(input0, "class", "svelte-12bm0ds");
    			add_location(input0, file$2, 152, 16, 5264);
    			attr_dev(td0, "class", "svelte-12bm0ds");
    			add_location(td0, file$2, 151, 14, 5242);
    			option0.__value = "metals";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 156, 18, 5439);
    			option1.__value = "colours";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 157, 18, 5497);
    			option2.__value = "stains";
    			option2.value = option2.__value;
    			add_location(option2, file$2, 158, 18, 5557);
    			if (/*add*/ ctx[2].type === void 0) add_render_callback(() => /*select_change_handler*/ ctx[25].call(select));
    			add_location(select, file$2, 155, 16, 5389);
    			attr_dev(td1, "class", "svelte-12bm0ds");
    			add_location(td1, file$2, 154, 14, 5367);
    			attr_dev(input1, "type", "color");
    			attr_dev(input1, "class", "svelte-12bm0ds");
    			add_location(input1, file$2, 162, 16, 5681);
    			attr_dev(td2, "class", "svelte-12bm0ds");
    			add_location(td2, file$2, 161, 14, 5659);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "0");
    			attr_dev(input2, "max", "100");
    			attr_dev(input2, "step", "1");
    			attr_dev(input2, "class", "svelte-12bm0ds");
    			add_location(input2, file$2, 165, 16, 5785);
    			attr_dev(td3, "class", "svelte-12bm0ds");
    			add_location(td3, file$2, 164, 14, 5763);
    			attr_dev(span, "class", "actionButton svelte-12bm0ds");
    			add_location(span, file$2, 168, 16, 5918);
    			attr_dev(td4, "class", "svelte-12bm0ds");
    			add_location(td4, file$2, 167, 14, 5896);
    			add_location(tr, file$2, 150, 12, 5206);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*add*/ ctx[2].name);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*add*/ ctx[2].type);
    			append_dev(tr, t4);
    			append_dev(tr, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*add*/ ctx[2].color);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, input2);
    			set_input_value(input2, /*add*/ ctx[2].chance);
    			append_dev(tr, t6);
    			append_dev(tr, td4);
    			append_dev(td4, span);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[24]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[25]),
    					listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[26]),
    					listen_dev(input2, "input", /*input2_input_handler_1*/ ctx[27]),
    					listen_dev(span, "click", /*cancelAddTincture*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*add*/ 4 && input0.value !== /*add*/ ctx[2].name) {
    				set_input_value(input0, /*add*/ ctx[2].name);
    			}

    			if (dirty[0] & /*add*/ 4) {
    				select_option(select, /*add*/ ctx[2].type);
    			}

    			if (dirty[0] & /*add*/ 4) {
    				set_input_value(input1, /*add*/ ctx[2].color);
    			}

    			if (dirty[0] & /*add*/ 4 && to_number(input2.value) !== /*add*/ ctx[2].chance) {
    				set_input_value(input2, /*add*/ ctx[2].chance);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!tr_transition) tr_transition = create_bidirectional_transition(tr, fade, {}, true);
    				tr_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!tr_transition) tr_transition = create_bidirectional_transition(tr, fade, {}, false);
    			tr_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (detaching && tr_transition) tr_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(150:10) {#if add.show}",
    		ctx
    	});

    	return block;
    }

    // (179:16) {#if defaultColors[t.t] && $colors[t.t] !== defaultColors[t.t]}
    function create_if_block$1(ctx) {
    	let svg;
    	let use;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[29](/*t*/ ctx[36]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			use = svg_element("use");
    			attr_dev(use, "href", "#undo-icon");
    			add_location(use, file$2, 180, 20, 6526);
    			attr_dev(svg, "width", "12");
    			attr_dev(svg, "height", "12");
    			attr_dev(svg, "fill", "#fff");
    			attr_dev(svg, "data-tooltip", "Restore default color");
    			add_location(svg, file$2, 179, 18, 6362);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, use);

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", click_handler_1, false, false, false),
    					action_destroyer(tooltip.call(null, svg))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(179:16) {#if defaultColors[t.t] && $colors[t.t] !== defaultColors[t.t]}",
    		ctx
    	});

    	return block;
    }

    // (173:10) {#each tData as t (t.t)}
    function create_each_block(key_1, ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*t*/ ctx[36].t + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*t*/ ctx[36].type + "";
    	let t2;
    	let t3;
    	let td2;
    	let input0;
    	let t4;
    	let t5;
    	let td3;
    	let input1;
    	let t6;
    	let span0;
    	let t7;
    	let t8_value = /*getTotalChance*/ ctx[5](/*t*/ ctx[36].type) + "";
    	let t8;
    	let t9;
    	let td4;
    	let span1;
    	let t11;
    	let rect;
    	let stop_animation = noop;
    	let mounted;
    	let dispose;

    	function input0_input_handler_2() {
    		/*input0_input_handler_2*/ ctx[28].call(input0, /*t*/ ctx[36]);
    	}

    	let if_block = defaultColors[/*t*/ ctx[36].t] && /*$colors*/ ctx[0][/*t*/ ctx[36].t] !== defaultColors[/*t*/ ctx[36].t] && create_if_block$1(ctx);

    	function input1_input_handler_2() {
    		/*input1_input_handler_2*/ ctx[30].call(input1, /*t*/ ctx[36]);
    	}

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[31](/*t*/ ctx[36]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			input0 = element("input");
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			td3 = element("td");
    			input1 = element("input");
    			t6 = space();
    			span0 = element("span");
    			t7 = text("/ ");
    			t8 = text(t8_value);
    			t9 = space();
    			td4 = element("td");
    			span1 = element("span");
    			span1.textContent = "×";
    			t11 = space();
    			attr_dev(td0, "class", "svelte-12bm0ds");
    			add_location(td0, file$2, 174, 14, 6128);
    			attr_dev(td1, "class", "svelte-12bm0ds");
    			add_location(td1, file$2, 175, 14, 6158);
    			attr_dev(input0, "type", "color");
    			attr_dev(input0, "class", "svelte-12bm0ds");
    			add_location(input0, file$2, 177, 16, 6213);
    			attr_dev(td2, "class", "svelte-12bm0ds");
    			add_location(td2, file$2, 176, 14, 6191);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "100");
    			attr_dev(input1, "step", "1");
    			attr_dev(input1, "class", "svelte-12bm0ds");
    			add_location(input1, file$2, 185, 16, 6659);
    			attr_dev(span0, "class", "totalChance svelte-12bm0ds");
    			add_location(span0, file$2, 186, 16, 6764);
    			attr_dev(td3, "class", "svelte-12bm0ds");
    			add_location(td3, file$2, 184, 14, 6637);
    			attr_dev(span1, "class", "actionButton svelte-12bm0ds");
    			add_location(span1, file$2, 189, 16, 6882);
    			attr_dev(td4, "class", "svelte-12bm0ds");
    			add_location(td4, file$2, 188, 14, 6860);
    			add_location(tr, file$2, 173, 12, 6095);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, input0);
    			set_input_value(input0, /*$colors*/ ctx[0][/*t*/ ctx[36].t]);
    			append_dev(td2, t4);
    			if (if_block) if_block.m(td2, null);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, input1);
    			set_input_value(input1, /*$tinctures*/ ctx[1][/*t*/ ctx[36].type][/*t*/ ctx[36].t]);
    			append_dev(td3, t6);
    			append_dev(td3, span0);
    			append_dev(span0, t7);
    			append_dev(span0, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td4);
    			append_dev(td4, span1);
    			append_dev(tr, t11);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler_2),
    					listen_dev(input1, "input", input1_input_handler_2),
    					listen_dev(span1, "click", click_handler_2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*tData*/ 8 && t0_value !== (t0_value = /*t*/ ctx[36].t + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*tData*/ 8 && t2_value !== (t2_value = /*t*/ ctx[36].type + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*$colors, tData*/ 9) {
    				set_input_value(input0, /*$colors*/ ctx[0][/*t*/ ctx[36].t]);
    			}

    			if (defaultColors[/*t*/ ctx[36].t] && /*$colors*/ ctx[0][/*t*/ ctx[36].t] !== defaultColors[/*t*/ ctx[36].t]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(td2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*$tinctures, tData*/ 10 && to_number(input1.value) !== /*$tinctures*/ ctx[1][/*t*/ ctx[36].type][/*t*/ ctx[36].t]) {
    				set_input_value(input1, /*$tinctures*/ ctx[1][/*t*/ ctx[36].type][/*t*/ ctx[36].t]);
    			}

    			if (dirty[0] & /*tData*/ 8 && t8_value !== (t8_value = /*getTotalChance*/ ctx[5](/*t*/ ctx[36].type) + "")) set_data_dev(t8, t8_value);
    		},
    		r: function measure() {
    			rect = tr.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(tr);
    			stop_animation();
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(tr, rect, flip, {});
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(173:10) {#each tData as t (t.t)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div4;
    	let span;
    	let t1;
    	let div3;
    	let div1;
    	let table0;
    	let thead0;
    	let tr0;
    	let th0;
    	let t3;
    	let th1;
    	let t5;
    	let th2;
    	let t7;
    	let th3;
    	let t9;
    	let th4;
    	let t11;
    	let tbody0;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let input0;
    	let t14;
    	let td2;
    	let input1;
    	let t15;
    	let td3;
    	let input2;
    	let t16;
    	let td4;
    	let input3;
    	let t17;
    	let tr2;
    	let td5;
    	let t19;
    	let td6;
    	let input4;
    	let t20;
    	let td7;
    	let input5;
    	let t21;
    	let td8;
    	let input6;
    	let t22;
    	let td9;
    	let input7;
    	let t23;
    	let tr3;
    	let td10;
    	let t25;
    	let td11;
    	let input8;
    	let t26;
    	let td12;
    	let input9;
    	let t27;
    	let td13;
    	let input10;
    	let t28;
    	let td14;
    	let input11;
    	let t29;
    	let div0;
    	let t30;
    	let button;
    	let t32;
    	let div2;
    	let table1;
    	let thead1;
    	let tr4;
    	let th5;
    	let t34;
    	let th6;
    	let t36;
    	let th7;
    	let t38;
    	let th8;
    	let t40;
    	let th9;
    	let t42;
    	let tbody1;
    	let t43;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div4_transition;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*add*/ ctx[2].show) return create_if_block_2$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*add*/ ctx[2].show && create_if_block_1$1(ctx);
    	let each_value = /*tData*/ ctx[3];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*t*/ ctx[36].t;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			span = element("span");
    			span.textContent = "×";
    			t1 = space();
    			div3 = element("div");
    			div1 = element("div");
    			table0 = element("table");
    			thead0 = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Element";
    			t3 = space();
    			th1 = element("th");
    			th1.textContent = "Metals";
    			t5 = space();
    			th2 = element("th");
    			th2.textContent = "Colours";
    			t7 = space();
    			th3 = element("th");
    			th3.textContent = "Stains";
    			t9 = space();
    			th4 = element("th");
    			th4.textContent = "Patterns";
    			t11 = space();
    			tbody0 = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Field";
    			t13 = space();
    			td1 = element("td");
    			input0 = element("input");
    			t14 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t15 = space();
    			td3 = element("td");
    			input2 = element("input");
    			t16 = space();
    			td4 = element("td");
    			input3 = element("input");
    			t17 = space();
    			tr2 = element("tr");
    			td5 = element("td");
    			td5.textContent = "Division";
    			t19 = space();
    			td6 = element("td");
    			input4 = element("input");
    			t20 = space();
    			td7 = element("td");
    			input5 = element("input");
    			t21 = space();
    			td8 = element("td");
    			input6 = element("input");
    			t22 = space();
    			td9 = element("td");
    			input7 = element("input");
    			t23 = space();
    			tr3 = element("tr");
    			td10 = element("td");
    			td10.textContent = "Charge";
    			t25 = space();
    			td11 = element("td");
    			input8 = element("input");
    			t26 = space();
    			td12 = element("td");
    			input9 = element("input");
    			t27 = space();
    			td13 = element("td");
    			input10 = element("input");
    			t28 = space();
    			td14 = element("td");
    			input11 = element("input");
    			t29 = space();
    			div0 = element("div");
    			if_block0.c();
    			t30 = space();
    			button = element("button");
    			button.textContent = "Restore Default";
    			t32 = space();
    			div2 = element("div");
    			table1 = element("table");
    			thead1 = element("thead");
    			tr4 = element("tr");
    			th5 = element("th");
    			th5.textContent = "Tincture";
    			t34 = space();
    			th6 = element("th");
    			th6.textContent = "Type";
    			t36 = space();
    			th7 = element("th");
    			th7.textContent = "Color";
    			t38 = space();
    			th8 = element("th");
    			th8.textContent = "Chance";
    			t40 = space();
    			th9 = element("th");
    			th9.textContent = "Remove";
    			t42 = space();
    			tbody1 = element("tbody");
    			if (if_block1) if_block1.c();
    			t43 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "close svelte-12bm0ds");
    			add_location(span, file$2, 89, 2, 2618);
    			add_location(th0, file$2, 95, 12, 2803);
    			add_location(th1, file$2, 96, 12, 2833);
    			add_location(th2, file$2, 97, 12, 2862);
    			add_location(th3, file$2, 98, 12, 2892);
    			add_location(th4, file$2, 99, 12, 2921);
    			add_location(tr0, file$2, 94, 10, 2785);
    			add_location(thead0, file$2, 93, 8, 2766);
    			attr_dev(td0, "class", "svelte-12bm0ds");
    			add_location(td0, file$2, 104, 12, 3020);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "100");
    			attr_dev(input0, "step", "1");
    			attr_dev(input0, "class", "svelte-12bm0ds");
    			add_location(input0, file$2, 105, 16, 3052);
    			attr_dev(td1, "class", "svelte-12bm0ds");
    			add_location(td1, file$2, 105, 12, 3048);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "100");
    			attr_dev(input1, "step", "1");
    			attr_dev(input1, "class", "svelte-12bm0ds");
    			add_location(input1, file$2, 106, 16, 3162);
    			attr_dev(td2, "class", "svelte-12bm0ds");
    			add_location(td2, file$2, 106, 12, 3158);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "0");
    			attr_dev(input2, "max", "100");
    			attr_dev(input2, "step", "1");
    			attr_dev(input2, "class", "svelte-12bm0ds");
    			add_location(input2, file$2, 107, 16, 3273);
    			attr_dev(td3, "class", "svelte-12bm0ds");
    			add_location(td3, file$2, 107, 12, 3269);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "min", "0");
    			attr_dev(input3, "max", "100");
    			attr_dev(input3, "step", "1");
    			attr_dev(input3, "class", "svelte-12bm0ds");
    			add_location(input3, file$2, 108, 16, 3383);
    			attr_dev(td4, "class", "svelte-12bm0ds");
    			add_location(td4, file$2, 108, 12, 3379);
    			add_location(tr1, file$2, 103, 10, 3002);
    			attr_dev(td5, "class", "svelte-12bm0ds");
    			add_location(td5, file$2, 111, 12, 3524);
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "min", "0");
    			attr_dev(input4, "max", "100");
    			attr_dev(input4, "step", "1");
    			attr_dev(input4, "class", "svelte-12bm0ds");
    			add_location(input4, file$2, 112, 16, 3559);
    			attr_dev(td6, "class", "svelte-12bm0ds");
    			add_location(td6, file$2, 112, 12, 3555);
    			attr_dev(input5, "type", "number");
    			attr_dev(input5, "min", "0");
    			attr_dev(input5, "max", "100");
    			attr_dev(input5, "step", "1");
    			attr_dev(input5, "class", "svelte-12bm0ds");
    			add_location(input5, file$2, 113, 16, 3672);
    			attr_dev(td7, "class", "svelte-12bm0ds");
    			add_location(td7, file$2, 113, 12, 3668);
    			attr_dev(input6, "type", "number");
    			attr_dev(input6, "min", "0");
    			attr_dev(input6, "max", "100");
    			attr_dev(input6, "step", "1");
    			attr_dev(input6, "class", "svelte-12bm0ds");
    			add_location(input6, file$2, 114, 16, 3786);
    			attr_dev(td8, "class", "svelte-12bm0ds");
    			add_location(td8, file$2, 114, 12, 3782);
    			attr_dev(input7, "type", "number");
    			attr_dev(input7, "min", "0");
    			attr_dev(input7, "max", "100");
    			attr_dev(input7, "step", "1");
    			attr_dev(input7, "class", "svelte-12bm0ds");
    			add_location(input7, file$2, 115, 16, 3899);
    			attr_dev(td9, "class", "svelte-12bm0ds");
    			add_location(td9, file$2, 115, 12, 3895);
    			add_location(tr2, file$2, 110, 10, 3506);
    			attr_dev(td10, "class", "svelte-12bm0ds");
    			add_location(td10, file$2, 118, 12, 4043);
    			attr_dev(input8, "type", "number");
    			attr_dev(input8, "min", "0");
    			attr_dev(input8, "max", "100");
    			attr_dev(input8, "step", "1");
    			attr_dev(input8, "class", "svelte-12bm0ds");
    			add_location(input8, file$2, 119, 16, 4076);
    			attr_dev(td11, "class", "svelte-12bm0ds");
    			add_location(td11, file$2, 119, 12, 4072);
    			attr_dev(input9, "type", "number");
    			attr_dev(input9, "min", "0");
    			attr_dev(input9, "max", "100");
    			attr_dev(input9, "step", "1");
    			attr_dev(input9, "class", "svelte-12bm0ds");
    			add_location(input9, file$2, 120, 16, 4187);
    			attr_dev(td12, "class", "svelte-12bm0ds");
    			add_location(td12, file$2, 120, 12, 4183);
    			attr_dev(input10, "type", "number");
    			attr_dev(input10, "min", "0");
    			attr_dev(input10, "max", "100");
    			attr_dev(input10, "step", "1");
    			attr_dev(input10, "class", "svelte-12bm0ds");
    			add_location(input10, file$2, 121, 16, 4299);
    			attr_dev(td13, "class", "svelte-12bm0ds");
    			add_location(td13, file$2, 121, 12, 4295);
    			attr_dev(input11, "type", "number");
    			attr_dev(input11, "min", "0");
    			attr_dev(input11, "max", "100");
    			attr_dev(input11, "step", "1");
    			attr_dev(input11, "class", "svelte-12bm0ds");
    			add_location(input11, file$2, 122, 16, 4410);
    			attr_dev(td14, "class", "svelte-12bm0ds");
    			add_location(td14, file$2, 122, 12, 4406);
    			add_location(tr3, file$2, 117, 10, 4025);
    			add_location(tbody0, file$2, 102, 8, 2983);
    			attr_dev(table0, "class", "svelte-12bm0ds");
    			add_location(table0, file$2, 92, 6, 2749);
    			attr_dev(button, "class", "svelte-12bm0ds");
    			add_location(button, file$2, 133, 8, 4794);
    			attr_dev(div0, "class", "contolButtons svelte-12bm0ds");
    			add_location(div0, file$2, 127, 6, 4566);
    			attr_dev(div1, "id", "left");
    			add_location(div1, file$2, 91, 4, 2726);
    			add_location(th5, file$2, 141, 12, 4984);
    			add_location(th6, file$2, 142, 12, 5015);
    			add_location(th7, file$2, 143, 12, 5042);
    			add_location(th8, file$2, 144, 12, 5070);
    			add_location(th9, file$2, 145, 12, 5099);
    			add_location(tr4, file$2, 140, 10, 4966);
    			add_location(thead1, file$2, 139, 8, 4947);
    			add_location(tbody1, file$2, 148, 8, 5159);
    			attr_dev(table1, "id", "tincturesTable");
    			attr_dev(table1, "class", "svelte-12bm0ds");
    			add_location(table1, file$2, 138, 6, 4910);
    			attr_dev(div2, "id", "right");
    			add_location(div2, file$2, 137, 4, 4886);
    			attr_dev(div3, "id", "tincturesCont");
    			attr_dev(div3, "class", "svelte-12bm0ds");
    			add_location(div3, file$2, 90, 2, 2696);
    			attr_dev(div4, "id", "tinctures");
    			attr_dev(div4, "class", "svelte-12bm0ds");
    			add_location(div4, file$2, 88, 0, 2572);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, span);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, table0);
    			append_dev(table0, thead0);
    			append_dev(thead0, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t3);
    			append_dev(tr0, th1);
    			append_dev(tr0, t5);
    			append_dev(tr0, th2);
    			append_dev(tr0, t7);
    			append_dev(tr0, th3);
    			append_dev(tr0, t9);
    			append_dev(tr0, th4);
    			append_dev(table0, t11);
    			append_dev(table0, tbody0);
    			append_dev(tbody0, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t13);
    			append_dev(tr1, td1);
    			append_dev(td1, input0);
    			set_input_value(input0, /*$tinctures*/ ctx[1].field.metals);
    			append_dev(tr1, t14);
    			append_dev(tr1, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*$tinctures*/ ctx[1].field.colours);
    			append_dev(tr1, t15);
    			append_dev(tr1, td3);
    			append_dev(td3, input2);
    			set_input_value(input2, /*$tinctures*/ ctx[1].field.stains);
    			append_dev(tr1, t16);
    			append_dev(tr1, td4);
    			append_dev(td4, input3);
    			set_input_value(input3, /*$tinctures*/ ctx[1].field.patterns);
    			append_dev(tbody0, t17);
    			append_dev(tbody0, tr2);
    			append_dev(tr2, td5);
    			append_dev(tr2, t19);
    			append_dev(tr2, td6);
    			append_dev(td6, input4);
    			set_input_value(input4, /*$tinctures*/ ctx[1].division.metals);
    			append_dev(tr2, t20);
    			append_dev(tr2, td7);
    			append_dev(td7, input5);
    			set_input_value(input5, /*$tinctures*/ ctx[1].division.colours);
    			append_dev(tr2, t21);
    			append_dev(tr2, td8);
    			append_dev(td8, input6);
    			set_input_value(input6, /*$tinctures*/ ctx[1].division.stains);
    			append_dev(tr2, t22);
    			append_dev(tr2, td9);
    			append_dev(td9, input7);
    			set_input_value(input7, /*$tinctures*/ ctx[1].division.patterns);
    			append_dev(tbody0, t23);
    			append_dev(tbody0, tr3);
    			append_dev(tr3, td10);
    			append_dev(tr3, t25);
    			append_dev(tr3, td11);
    			append_dev(td11, input8);
    			set_input_value(input8, /*$tinctures*/ ctx[1].charge.metals);
    			append_dev(tr3, t26);
    			append_dev(tr3, td12);
    			append_dev(td12, input9);
    			set_input_value(input9, /*$tinctures*/ ctx[1].charge.colours);
    			append_dev(tr3, t27);
    			append_dev(tr3, td13);
    			append_dev(td13, input10);
    			set_input_value(input10, /*$tinctures*/ ctx[1].charge.stains);
    			append_dev(tr3, t28);
    			append_dev(tr3, td14);
    			append_dev(td14, input11);
    			set_input_value(input11, /*$tinctures*/ ctx[1].charge.patterns);
    			append_dev(div1, t29);
    			append_dev(div1, div0);
    			if_block0.m(div0, null);
    			append_dev(div0, t30);
    			append_dev(div0, button);
    			append_dev(div3, t32);
    			append_dev(div3, div2);
    			append_dev(div2, table1);
    			append_dev(table1, thead1);
    			append_dev(thead1, tr4);
    			append_dev(tr4, th5);
    			append_dev(tr4, t34);
    			append_dev(tr4, th6);
    			append_dev(tr4, t36);
    			append_dev(tr4, th7);
    			append_dev(tr4, t38);
    			append_dev(tr4, th8);
    			append_dev(tr4, t40);
    			append_dev(tr4, th9);
    			append_dev(table1, t42);
    			append_dev(table1, tbody1);
    			if (if_block1) if_block1.m(tbody1, null);
    			append_dev(tbody1, t43);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "click", /*click_handler*/ ctx[11], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[12]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[13]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[14]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[15]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[16]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[17]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[18]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[19]),
    					listen_dev(input8, "input", /*input8_input_handler*/ ctx[20]),
    					listen_dev(input9, "input", /*input9_input_handler*/ ctx[21]),
    					listen_dev(input10, "input", /*input10_input_handler*/ ctx[22]),
    					listen_dev(input11, "input", /*input11_input_handler*/ ctx[23]),
    					listen_dev(button, "click", /*restoreDefault*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$tinctures*/ 2 && to_number(input0.value) !== /*$tinctures*/ ctx[1].field.metals) {
    				set_input_value(input0, /*$tinctures*/ ctx[1].field.metals);
    			}

    			if (dirty[0] & /*$tinctures*/ 2 && to_number(input1.value) !== /*$tinctures*/ ctx[1].field.colours) {
    				set_input_value(input1, /*$tinctures*/ ctx[1].field.colours);
    			}

    			if (dirty[0] & /*$tinctures*/ 2 && to_number(input2.value) !== /*$tinctures*/ ctx[1].field.stains) {
    				set_input_value(input2, /*$tinctures*/ ctx[1].field.stains);
    			}

    			if (dirty[0] & /*$tinctures*/ 2 && to_number(input3.value) !== /*$tinctures*/ ctx[1].field.patterns) {
    				set_input_value(input3, /*$tinctures*/ ctx[1].field.patterns);
    			}

    			if (dirty[0] & /*$tinctures*/ 2 && to_number(input4.value) !== /*$tinctures*/ ctx[1].division.metals) {
    				set_input_value(input4, /*$tinctures*/ ctx[1].division.metals);
    			}

    			if (dirty[0] & /*$tinctures*/ 2 && to_number(input5.value) !== /*$tinctures*/ ctx[1].division.colours) {
    				set_input_value(input5, /*$tinctures*/ ctx[1].division.colours);
    			}

    			if (dirty[0] & /*$tinctures*/ 2 && to_number(input6.value) !== /*$tinctures*/ ctx[1].division.stains) {
    				set_input_value(input6, /*$tinctures*/ ctx[1].division.stains);
    			}

    			if (dirty[0] & /*$tinctures*/ 2 && to_number(input7.value) !== /*$tinctures*/ ctx[1].division.patterns) {
    				set_input_value(input7, /*$tinctures*/ ctx[1].division.patterns);
    			}

    			if (dirty[0] & /*$tinctures*/ 2 && to_number(input8.value) !== /*$tinctures*/ ctx[1].charge.metals) {
    				set_input_value(input8, /*$tinctures*/ ctx[1].charge.metals);
    			}

    			if (dirty[0] & /*$tinctures*/ 2 && to_number(input9.value) !== /*$tinctures*/ ctx[1].charge.colours) {
    				set_input_value(input9, /*$tinctures*/ ctx[1].charge.colours);
    			}

    			if (dirty[0] & /*$tinctures*/ 2 && to_number(input10.value) !== /*$tinctures*/ ctx[1].charge.stains) {
    				set_input_value(input10, /*$tinctures*/ ctx[1].charge.stains);
    			}

    			if (dirty[0] & /*$tinctures*/ 2 && to_number(input11.value) !== /*$tinctures*/ ctx[1].charge.patterns) {
    				set_input_value(input11, /*$tinctures*/ ctx[1].charge.patterns);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, t30);
    				}
    			}

    			if (/*add*/ ctx[2].show) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*add*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(tbody1, t43);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*removeTincture, tData, getTotalChance, $tinctures, $colors*/ 107) {
    				each_value = /*tData*/ ctx[3];
    				validate_each_argument(each_value);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody1, fix_and_destroy_block, create_each_block, null, get_each_context);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);

    			if (local) {
    				add_render_callback(() => {
    					if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, true);
    					div4_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);

    			if (local) {
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, false);
    				div4_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_block0.d();
    			if (if_block1) if_block1.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching && div4_transition) div4_transition.end();
    			mounted = false;
    			run_all(dispose);
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
    	let tData;
    	let $message;
    	let $colors;
    	let $tinctures;
    	let $state;
    	validate_store(message, 'message');
    	component_subscribe($$self, message, $$value => $$invalidate(33, $message = $$value));
    	validate_store(colors, 'colors');
    	component_subscribe($$self, colors, $$value => $$invalidate(0, $colors = $$value));
    	validate_store(tinctures, 'tinctures');
    	component_subscribe($$self, tinctures, $$value => $$invalidate(1, $tinctures = $$value));
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(4, $state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tinctures', slots, []);

    	let add = {
    		show: false,
    		name: "",
    		type: "colours",
    		color: "#96C8FA",
    		chance: 3
    	};

    	// remove stored weighted array
    	for (const key in $tinctures) {
    		delete $tinctures[key].array;
    	}

    	// don't lock options on load
    	let loaded = [];

    	function lock(key, value) {
    		if (loaded.includes(key)) localStorage.setItem(key, JSON.stringify(value)); else loaded.push(key);
    	}

    	function updateCOAonColorChange() {
    		changes.refresh();
    	}

    	function getTotalChance(type) {
    		return Object.entries($tinctures[type]).reduce((a, b) => a + b[1], 0);
    	}

    	function removeTincture(t) {
    		if (t.type === "metals" || t.type === "colours") {
    			const typeItems = Object.keys($tinctures[t.type]);

    			if (typeItems.length < 3) {
    				set_store_value(
    					message,
    					$message = {
    						type: "error",
    						text: `There should be at least 2 tinctures of type '${t.type}'!`
    					},
    					$message
    				);

    				return;
    			}
    		}

    		delete $tinctures[t.type][t.t];
    		tinctures.set($tinctures);
    	}

    	function addTincture() {
    		$$invalidate(2, add.show = true, add);

    		set_store_value(
    			message,
    			$message = {
    				type: "warn",
    				text: `Set tincture name, type, color and chance and then click on 'Apply Tincture'`,
    				timeout: 8000
    			},
    			$message
    		);
    	}

    	function cancelAddTincture() {
    		$$invalidate(2, add.show = false, add);
    	}

    	function applyAddTincture() {
    		const name = camelize(add.name);

    		if (!name || $colors[name]) {
    			set_store_value(
    				message,
    				$message = {
    					type: "error",
    					text: `Tincture name must be unique!`
    				},
    				$message
    			);

    			return;
    		}

    		set_store_value(tinctures, $tinctures[add.type][name] = add.chance, $tinctures);
    		set_store_value(colors, $colors[name] = add.color, $colors);
    		$$invalidate(2, add.show = false, add);

    		set_store_value(
    			message,
    			$message = {
    				type: "info",
    				text: `Tincture ${name} is added`
    			},
    			$message
    		);
    	}

    	function restoreDefault() {
    		set_store_value(tinctures, $tinctures = JSON.parse(JSON.stringify(defaultTinctures)), $tinctures);
    		set_store_value(colors, $colors = JSON.parse(JSON.stringify(defaultColors)), $colors);
    		localStorage.removeItem("tinctures");
    		localStorage.removeItem("colors");
    		loaded = [];

    		set_store_value(
    			message,
    			$message = {
    				type: "info",
    				text: `Default values are restored`
    			},
    			$message
    		);
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tinctures> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => set_store_value(state, $state.tinctures = 0, $state);

    	function input0_input_handler() {
    		$tinctures.field.metals = to_number(this.value);
    		tinctures.set($tinctures);
    	}

    	function input1_input_handler() {
    		$tinctures.field.colours = to_number(this.value);
    		tinctures.set($tinctures);
    	}

    	function input2_input_handler() {
    		$tinctures.field.stains = to_number(this.value);
    		tinctures.set($tinctures);
    	}

    	function input3_input_handler() {
    		$tinctures.field.patterns = to_number(this.value);
    		tinctures.set($tinctures);
    	}

    	function input4_input_handler() {
    		$tinctures.division.metals = to_number(this.value);
    		tinctures.set($tinctures);
    	}

    	function input5_input_handler() {
    		$tinctures.division.colours = to_number(this.value);
    		tinctures.set($tinctures);
    	}

    	function input6_input_handler() {
    		$tinctures.division.stains = to_number(this.value);
    		tinctures.set($tinctures);
    	}

    	function input7_input_handler() {
    		$tinctures.division.patterns = to_number(this.value);
    		tinctures.set($tinctures);
    	}

    	function input8_input_handler() {
    		$tinctures.charge.metals = to_number(this.value);
    		tinctures.set($tinctures);
    	}

    	function input9_input_handler() {
    		$tinctures.charge.colours = to_number(this.value);
    		tinctures.set($tinctures);
    	}

    	function input10_input_handler() {
    		$tinctures.charge.stains = to_number(this.value);
    		tinctures.set($tinctures);
    	}

    	function input11_input_handler() {
    		$tinctures.charge.patterns = to_number(this.value);
    		tinctures.set($tinctures);
    	}

    	function input0_input_handler_1() {
    		add.name = this.value;
    		$$invalidate(2, add);
    	}

    	function select_change_handler() {
    		add.type = select_value(this);
    		$$invalidate(2, add);
    	}

    	function input1_input_handler_1() {
    		add.color = this.value;
    		$$invalidate(2, add);
    	}

    	function input2_input_handler_1() {
    		add.chance = to_number(this.value);
    		$$invalidate(2, add);
    	}

    	function input0_input_handler_2(t) {
    		$colors[t.t] = this.value;
    		colors.set($colors);
    		($$invalidate(3, tData), $$invalidate(1, $tinctures));
    	}

    	const click_handler_1 = t => set_store_value(colors, $colors[t.t] = defaultColors[t.t], $colors);

    	function input1_input_handler_2(t) {
    		$tinctures[t.type][t.t] = to_number(this.value);
    		tinctures.set($tinctures);
    		($$invalidate(3, tData), $$invalidate(1, $tinctures));
    	}

    	const click_handler_2 = t => removeTincture(t);

    	$$self.$capture_state = () => ({
    		fade,
    		flip,
    		colors,
    		tinctures,
    		state,
    		message,
    		changes,
    		defaultTinctures,
    		defaultColors,
    		camelize,
    		tooltip,
    		add,
    		loaded,
    		lock,
    		updateCOAonColorChange,
    		getTotalChance,
    		removeTincture,
    		addTincture,
    		cancelAddTincture,
    		applyAddTincture,
    		restoreDefault,
    		tData,
    		$message,
    		$colors,
    		$tinctures,
    		$state
    	});

    	$$self.$inject_state = $$props => {
    		if ('add' in $$props) $$invalidate(2, add = $$props.add);
    		if ('loaded' in $$props) loaded = $$props.loaded;
    		if ('tData' in $$props) $$invalidate(3, tData = $$props.tData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$tinctures*/ 2) {
    			$$invalidate(3, tData = ["metals", "colours", "stains"].map(type => {
    				return Object.keys($tinctures[type]).map(t => {
    					return { t, type };
    				});
    			}).flat());
    		}

    		if ($$self.$$.dirty[0] & /*$tinctures*/ 2) {
    			lock("tinctures", $tinctures);
    		}

    		if ($$self.$$.dirty[0] & /*$colors*/ 1) {
    			lock("colors", $colors);
    		}

    		if ($$self.$$.dirty[0] & /*$colors*/ 1) {
    			updateCOAonColorChange();
    		}
    	};

    	return [
    		$colors,
    		$tinctures,
    		add,
    		tData,
    		$state,
    		getTotalChance,
    		removeTincture,
    		addTincture,
    		cancelAddTincture,
    		applyAddTincture,
    		restoreDefault,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		input9_input_handler,
    		input10_input_handler,
    		input11_input_handler,
    		input0_input_handler_1,
    		select_change_handler,
    		input1_input_handler_1,
    		input2_input_handler_1,
    		input0_input_handler_2,
    		click_handler_1,
    		input1_input_handler_2,
    		click_handler_2
    	];
    }

    class Tinctures extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tinctures",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Message.svelte generated by Svelte v3.44.2 */
    const file$1 = "src\\components\\Message.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let t;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(div, "class", "" + (null_to_empty(/*type*/ ctx[1]) + " svelte-1txtc79"));
    			add_location(div, file$1, 19, 0, 426);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*hideMessage*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fly, { y: 200, duration: 500 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, { duration: 300 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
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
    	let $message;
    	validate_store(message, 'message');
    	component_subscribe($$self, message, $$value => $$invalidate(3, $message = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Message', slots, []);
    	const { text, type = "info", timeout = 4000 } = $message;

    	onMount(async () => {
    		const text = $message.text;

    		setTimeout(
    			() => {
    				if ($message?.text === text) set_store_value(message, $message = null, $message);
    			},
    			timeout
    		);
    	});

    	function hideMessage() {
    		set_store_value(message, $message = null, $message);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Message> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		fly,
    		fade,
    		message,
    		text,
    		type,
    		timeout,
    		hideMessage,
    		$message
    	});

    	return [text, type, hideMessage];
    }

    class Message extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Message",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\components\App.svelte generated by Svelte v3.44.2 */

    const { console: console_1 } = globals;
    const file = "src\\components\\App.svelte";

    // (117:0) {:else}
    function create_else_block(ctx) {
    	let main;
    	let navbar;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let current_block_type_index;
    	let if_block5;
    	let t6;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	let if_block0 = /*$state*/ ctx[6].about && create_if_block_7(ctx);
    	let if_block1 = /*$state*/ ctx[6].license && create_if_block_6(ctx);
    	let if_block2 = /*$state*/ ctx[6].raster && create_if_block_5(ctx);
    	let if_block3 = /*$state*/ ctx[6].vector && create_if_block_4(ctx);
    	let if_block4 = /*$state*/ ctx[6].tinctures && create_if_block_3(ctx);
    	const if_block_creators = [create_if_block_2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$state*/ ctx[6].edit) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block5 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block6 = /*$message*/ ctx[5] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			if (if_block3) if_block3.c();
    			t4 = space();
    			if (if_block4) if_block4.c();
    			t5 = space();
    			if_block5.c();
    			t6 = space();
    			if (if_block6) if_block6.c();
    			set_style(main, "background-color", /*$background*/ ctx[7]);
    			attr_dev(main, "class", "svelte-32wlsa");
    			add_location(main, file, 117, 2, 3966);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t0);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t1);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t2);
    			if (if_block2) if_block2.m(main, null);
    			append_dev(main, t3);
    			if (if_block3) if_block3.m(main, null);
    			append_dev(main, t4);
    			if (if_block4) if_block4.m(main, null);
    			append_dev(main, t5);
    			if_blocks[current_block_type_index].m(main, null);
    			append_dev(main, t6);
    			if (if_block6) if_block6.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*$state*/ ctx[6].about) {
    				if (if_block0) {
    					if (dirty & /*$state*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$state*/ ctx[6].license) {
    				if (if_block1) {
    					if (dirty & /*$state*/ 64) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*$state*/ ctx[6].raster) {
    				if (if_block2) {
    					if (dirty & /*$state*/ 64) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_5(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(main, t3);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*$state*/ ctx[6].vector) {
    				if (if_block3) {
    					if (dirty & /*$state*/ 64) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_4(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(main, t4);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*$state*/ ctx[6].tinctures) {
    				if (if_block4) {
    					if (dirty & /*$state*/ 64) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_3(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(main, t5);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block5 = if_blocks[current_block_type_index];

    				if (!if_block5) {
    					if_block5 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block5.c();
    				} else {
    					if_block5.p(ctx, dirty);
    				}

    				transition_in(if_block5, 1);
    				if_block5.m(main, t6);
    			}

    			if (/*$message*/ ctx[5]) {
    				if (if_block6) {
    					if (dirty & /*$message*/ 32) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_1(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(main, null);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$background*/ 128) {
    				set_style(main, "background-color", /*$background*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if_blocks[current_block_type_index].d();
    			if (if_block6) if_block6.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(117:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (115:0) {#if $state.view}
    function create_if_block(ctx) {
    	let viewer;
    	let current;

    	viewer = new Viewer({
    			props: {
    				c: /*$state*/ ctx[6].c,
    				seed: /*seed*/ ctx[3],
    				coaSize: /*coaSize*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(viewer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(viewer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const viewer_changes = {};
    			if (dirty & /*$state*/ 64) viewer_changes.c = /*$state*/ ctx[6].c;
    			if (dirty & /*seed*/ 8) viewer_changes.seed = /*seed*/ ctx[3];
    			if (dirty & /*coaSize*/ 16) viewer_changes.coaSize = /*coaSize*/ ctx[4];
    			viewer.$set(viewer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(viewer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(viewer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(viewer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(115:0) {#if $state.view}",
    		ctx
    	});

    	return block;
    }

    // (120:4) {#if $state.about}
    function create_if_block_7(ctx) {
    	let about;
    	let current;
    	about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(120:4) {#if $state.about}",
    		ctx
    	});

    	return block;
    }

    // (121:4) {#if $state.license}
    function create_if_block_6(ctx) {
    	let license;
    	let current;
    	license = new License({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(license.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(license, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(license.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(license.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(license, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(121:4) {#if $state.license}",
    		ctx
    	});

    	return block;
    }

    // (122:4) {#if $state.raster}
    function create_if_block_5(ctx) {
    	let uploadraster;
    	let current;
    	uploadraster = new UploadRaster({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(uploadraster.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(uploadraster, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uploadraster.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uploadraster.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(uploadraster, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(122:4) {#if $state.raster}",
    		ctx
    	});

    	return block;
    }

    // (123:4) {#if $state.vector}
    function create_if_block_4(ctx) {
    	let uploadvector;
    	let current;
    	uploadvector = new UploadVector({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(uploadvector.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(uploadvector, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uploadvector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uploadvector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(uploadvector, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(123:4) {#if $state.vector}",
    		ctx
    	});

    	return block;
    }

    // (124:4) {#if $state.tinctures}
    function create_if_block_3(ctx) {
    	let tinctures;
    	let current;
    	tinctures = new Tinctures({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tinctures.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tinctures, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tinctures.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tinctures.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tinctures, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(124:4) {#if $state.tinctures}",
    		ctx
    	});

    	return block;
    }

    // (126:4) {:else}
    function create_else_block_1(ctx) {
    	let gallery_1;
    	let current;

    	gallery_1 = new Gallery({
    			props: {
    				gallery: /*gallery*/ ctx[2],
    				w: /*w*/ ctx[0],
    				h: /*h*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gallery_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gallery_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gallery_1_changes = {};
    			if (dirty & /*gallery*/ 4) gallery_1_changes.gallery = /*gallery*/ ctx[2];
    			if (dirty & /*w*/ 1) gallery_1_changes.w = /*w*/ ctx[0];
    			if (dirty & /*h*/ 2) gallery_1_changes.h = /*h*/ ctx[1];
    			gallery_1.$set(gallery_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallery_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallery_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gallery_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(126:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (125:4) {#if $state.edit}
    function create_if_block_2(ctx) {
    	let editor;
    	let current;

    	editor = new Editor({
    			props: {
    				c: /*$state*/ ctx[6].c,
    				seed: /*seed*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(editor.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(editor, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editor_changes = {};
    			if (dirty & /*$state*/ 64) editor_changes.c = /*$state*/ ctx[6].c;
    			if (dirty & /*seed*/ 8) editor_changes.seed = /*seed*/ ctx[3];
    			editor.$set(editor_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(editor, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(125:4) {#if $state.edit}",
    		ctx
    	});

    	return block;
    }

    // (127:4) {#if $message}
    function create_if_block_1(ctx) {
    	let message_1;
    	let current;
    	message_1 = new Message({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(message_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(message_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(message_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(message_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(message_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(127:4) {#if $message}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let windowevents;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$state*/ ctx[6].view) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	windowevents = new WindowEvents({ $$inline: true });

    	const block = {
    		c: function create() {
    			if_block.c();
    			t = space();
    			create_component(windowevents.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(windowevents, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				if_block.m(t.parentNode, t);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(windowevents.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(windowevents.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(windowevents, detaching);
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
    	let $message;
    	let $state;
    	let $matrices;
    	let $history;
    	let $matrix;
    	let $shield;
    	let $size;
    	let $background;
    	validate_store(message, 'message');
    	component_subscribe($$self, message, $$value => $$invalidate(5, $message = $$value));
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(6, $state = $$value));
    	validate_store(matrices, 'matrices');
    	component_subscribe($$self, matrices, $$value => $$invalidate(11, $matrices = $$value));
    	validate_store(history, 'history');
    	component_subscribe($$self, history, $$value => $$invalidate(12, $history = $$value));
    	validate_store(matrix, 'matrix');
    	component_subscribe($$self, matrix, $$value => $$invalidate(8, $matrix = $$value));
    	validate_store(shield, 'shield');
    	component_subscribe($$self, shield, $$value => $$invalidate(13, $shield = $$value));
    	validate_store(size, 'size');
    	component_subscribe($$self, size, $$value => $$invalidate(9, $size = $$value));
    	validate_store(background, 'background');
    	component_subscribe($$self, background, $$value => $$invalidate(7, $background = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let n, w, h, gallery = [], seed, coaSize = 200;
    	checkLoadParameters(); // on load

    	function handleMatrixChange() {
    		const l = $history.length;

    		// reroll is clicked
    		if (!$matrices[$matrix]) {
    			if ($state.edit) {
    				// generate new coa
    				set_store_value(matrices, $matrices[$matrix] = $matrices[$matrix - 1].slice(), $matrices);

    				set_store_value(matrices, $matrices[$matrix][$state.i] = l, $matrices);
    				$$invalidate(3, seed = undefined); // use once
    			} else {
    				// reroll gallery
    				set_store_value(matrices, $matrices[$matrix] = Array.from({ length: n }, (_, i) => l + i++), $matrices);
    			}

    			// change shield if it's not locked (manually selected)
    			if (!localStorage.getItem("shield")) {
    				set_store_value(shield, $shield = rw(shields[rw(shields.types)]), $shield);
    			}
    		}

    		// add additional coas to matrix if size is smaller
    		if ($matrices[$matrix].length < n) {
    			const m = $matrices[$matrix];
    			set_store_value(matrices, $matrices[$matrix] = [...Array(n).keys()].map(i => m[i] !== undefined ? m[i] : l + i), $matrices);
    		}

    		$$invalidate(2, gallery = $matrices[$matrix].slice(0, n)); // trim gallery if size was bigger

    		// on coa edit or view mode
    		if ($state.edit || $state.view) set_store_value(state, $state.c = $matrices[$matrix][$state.i], $state);
    	}

    	function checkLoadParameters() {
    		const url = new URL(window.location);
    		const viewParam = url.searchParams.get("view") == 1;
    		const sizeParam = +url.searchParams.get("size");
    		const coaParam = url.searchParams.get("coa");
    		const seedParam = url.searchParams.get("seed");
    		const from = url.searchParams.get("from");
    		if (!coaParam && !seedParam) return; // no predefined coa, regular flow (generate gallery)

    		if (coaParam) {
    			// exact coa to render
    			if (!validateJSON(coaParam)) return;

    			$history.push(JSON.parse(coaParam));
    		} else if (seedParam) {
    			// exact seed to use
    			$$invalidate(3, seed = isNaN(+seedParam) ? seedParam : +seedParam);
    		}

    		if (coaParam || seedParam) {
    			if (from === "FMG") {
    				const text = "Configure emblem, save it in SVG format and then load back to the Fantasy Map Generator";
    				set_store_value(message, $message = { type: "info", text, timeout: 10000 }, $message);
    			}

    			set_store_value(matrices, $matrices[0] = [0], $matrices);

    			if (viewParam) {
    				if (sizeParam) $$invalidate(4, coaSize = sizeParam);
    				set_store_value(state, $state.view = 1, $state); // open in view only mode
    			} else set_store_value(state, $state.edit = 1, $state); // open in edit mode
    		}
    	}

    	function validateJSON(text) {
    		try {
    			JSON.parse(text);
    			return true;
    		} catch(e) {
    			console.error(e);

    			set_store_value(
    				message,
    				$message = {
    					type: "error",
    					text: `URL error: ${e.message}`,
    					timeout: 5000
    				},
    				$message
    			);

    			return false;
    		}
    	}

    	// define number and size of coas to display
    	function defineGallerySize(desiredSize) {
    		const width = window.innerWidth;
    		const height = window.innerHeight - 60;
    		const numberX = Math.ceil(width / desiredSize);
    		const w = Math.floor(width / numberX);
    		const numberY = Math.floor(height / w);
    		const h = Math.floor(height / numberY);
    		return [numberX * numberY, w, h];
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		WindowEvents,
    		Navbar,
    		About,
    		License,
    		Viewer,
    		Editor,
    		Gallery,
    		UploadRaster,
    		UploadVector,
    		Tinctures,
    		Message,
    		background,
    		size,
    		history,
    		matrices,
    		matrix,
    		state,
    		message,
    		shield,
    		shields,
    		rw,
    		n,
    		w,
    		h,
    		gallery,
    		seed,
    		coaSize,
    		handleMatrixChange,
    		checkLoadParameters,
    		validateJSON,
    		defineGallerySize,
    		$message,
    		$state,
    		$matrices,
    		$history,
    		$matrix,
    		$shield,
    		$size,
    		$background
    	});

    	$$self.$inject_state = $$props => {
    		if ('n' in $$props) n = $$props.n;
    		if ('w' in $$props) $$invalidate(0, w = $$props.w);
    		if ('h' in $$props) $$invalidate(1, h = $$props.h);
    		if ('gallery' in $$props) $$invalidate(2, gallery = $$props.gallery);
    		if ('seed' in $$props) $$invalidate(3, seed = $$props.seed);
    		if ('coaSize' in $$props) $$invalidate(4, coaSize = $$props.coaSize);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$size*/ 512) {
    			$$invalidate(0, [n, w, h] = defineGallerySize($size), w, ($$invalidate(1, h), $$invalidate(9, $size)));
    		}

    		if ($$self.$$.dirty & /*$matrix, $size*/ 768) {
    			handleMatrixChange();
    		}
    	};

    	return [w, h, gallery, seed, coaSize, $message, $state, $background, $matrix, $size];
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

    document.querySelector.bind(document);
    document.querySelectorAll.bind(document);
    Node.prototype.on = window.on = function (name, fn) {
        this.addEventListener(name, fn);
    };
    Node.prototype.off = window.off = function (name, fn) {
        this.removeEventListener(name, fn);
    };

    // register serviceWorker
    if ("serviceWorker" in navigator && location.hostname !== "localhost") {
      navigator.serviceWorker.register("./sw.js");
    }

    const app = new App({
      target: document.body,
      props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
