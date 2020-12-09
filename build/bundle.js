
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
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
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
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
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
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

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
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
            const d = program.b - t;
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

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
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
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
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

    /* src\Tooltip.svelte generated by Svelte v3.29.4 */

    const file = "src\\Tooltip.svelte";
    const get_custom_tip_slot_changes = dirty => ({});
    const get_custom_tip_slot_context = ctx => ({});

    // (15:4) {:else}
    function create_else_block(ctx) {
    	let current;
    	const custom_tip_slot_template = /*#slots*/ ctx[9]["custom-tip"];
    	const custom_tip_slot = create_slot(custom_tip_slot_template, ctx, /*$$scope*/ ctx[8], get_custom_tip_slot_context);

    	const block = {
    		c: function create() {
    			if (custom_tip_slot) custom_tip_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (custom_tip_slot) {
    				custom_tip_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (custom_tip_slot) {
    				if (custom_tip_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(custom_tip_slot, custom_tip_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_custom_tip_slot_changes, get_custom_tip_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(custom_tip_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(custom_tip_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (custom_tip_slot) custom_tip_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(15:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#if tip}
    function create_if_block(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*tip*/ ctx[0]);
    			attr_dev(div, "class", "default-tip svelte-bcrf0u");
    			attr_dev(div, "style", /*style*/ ctx[6]);
    			add_location(div, file, 13, 6, 485);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tip*/ 1) set_data_dev(t, /*tip*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(13:4) {#if tip}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div1;
    	let span;
    	let t;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tip*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			t = space();
    			div0 = element("div");
    			if_block.c();
    			attr_dev(span, "class", "tooltip-slot svelte-bcrf0u");
    			add_location(span, file, 8, 2, 327);
    			attr_dev(div0, "class", "tooltip svelte-bcrf0u");
    			toggle_class(div0, "active", /*active*/ ctx[4]);
    			toggle_class(div0, "left", /*left*/ ctx[3]);
    			toggle_class(div0, "right", /*right*/ ctx[5]);
    			toggle_class(div0, "bottom", /*bottom*/ ctx[2]);
    			toggle_class(div0, "top", /*top*/ ctx[1]);
    			add_location(div0, file, 11, 2, 382);
    			attr_dev(div1, "class", "tooltip-wrapper svelte-bcrf0u");
    			add_location(div1, file, 7, 0, 294);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			append_dev(div1, t);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

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
    				}

    				transition_in(if_block, 1);
    				if_block.m(div0, null);
    			}

    			if (dirty & /*active*/ 16) {
    				toggle_class(div0, "active", /*active*/ ctx[4]);
    			}

    			if (dirty & /*left*/ 8) {
    				toggle_class(div0, "left", /*left*/ ctx[3]);
    			}

    			if (dirty & /*right*/ 32) {
    				toggle_class(div0, "right", /*right*/ ctx[5]);
    			}

    			if (dirty & /*bottom*/ 4) {
    				toggle_class(div0, "bottom", /*bottom*/ ctx[2]);
    			}

    			if (dirty & /*top*/ 2) {
    				toggle_class(div0, "top", /*top*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			if_blocks[current_block_type_index].d();
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
    	validate_slots("Tooltip", slots, ['default','custom-tip']);

    	let { tip = "" } = $$props,
    		{ top = false } = $$props,
    		{ bottom = false } = $$props,
    		{ left = false } = $$props,
    		{ active = false } = $$props,
    		{ color = "#222" } = $$props;

    	let right = top || bottom || left ? false : true; // default side 
    	let style = `background-color: ${color};`;
    	const writable_props = ["tip", "top", "bottom", "left", "active", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tooltip> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("tip" in $$props) $$invalidate(0, tip = $$props.tip);
    		if ("top" in $$props) $$invalidate(1, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(2, bottom = $$props.bottom);
    		if ("left" in $$props) $$invalidate(3, left = $$props.left);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    		if ("color" in $$props) $$invalidate(7, color = $$props.color);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		tip,
    		top,
    		bottom,
    		left,
    		active,
    		color,
    		right,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("tip" in $$props) $$invalidate(0, tip = $$props.tip);
    		if ("top" in $$props) $$invalidate(1, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(2, bottom = $$props.bottom);
    		if ("left" in $$props) $$invalidate(3, left = $$props.left);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    		if ("color" in $$props) $$invalidate(7, color = $$props.color);
    		if ("right" in $$props) $$invalidate(5, right = $$props.right);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tip, top, bottom, left, active, right, style, color, $$scope, slots];
    }

    class Tooltip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			tip: 0,
    			top: 1,
    			bottom: 2,
    			left: 3,
    			active: 4,
    			color: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tooltip",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get tip() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tip(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Lock.svelte generated by Svelte v3.29.4 */
    const file$1 = "src\\Lock.svelte";

    // (12:0) {#if locked}
    function create_if_block$1(ctx) {
    	let tooltip;
    	let current;

    	tooltip = new Tooltip({
    			props: {
    				tip: "Option is locked. Selected value will be always used on app load. Click to unlock and apply default value on load",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tooltip.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tooltip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tooltip_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tooltip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(12:0) {#if locked}",
    		ctx
    	});

    	return block;
    }

    // (13:2) <Tooltip tip="Option is locked. Selected value will be always used on app load. Click to unlock and apply default value on load">
    function create_default_slot(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "🔒";
    			set_style(span, "cursor", "pointer");
    			add_location(span, file$1, 13, 4, 364);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*unlock*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(13:2) <Tooltip tip=\\\"Option is locked. Selected value will be always used on app load. Click to unlock and apply default value on load\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*locked*/ ctx[0] && create_if_block$1(ctx);

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
    			if (/*locked*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*locked*/ 1) {
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Lock", slots, []);
    	let { key } = $$props;

    	function unlock() {
    		localStorage.removeItem(key);
    		$$invalidate(0, locked = false);
    	}

    	const writable_props = ["key"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lock> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(2, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({ Tooltip, key, unlock, locked });

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(2, key = $$props.key);
    		if ("locked" in $$props) $$invalidate(0, locked = $$props.locked);
    	};

    	let locked;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*key*/ 4) {
    			 $$invalidate(0, locked = localStorage.getItem(key));
    		}
    	};

    	return [locked, unlock, key];
    }

    class Lock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { key: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lock",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[2] === undefined && !("key" in props)) {
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

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quartInOut(t) {
        return t < 0.5
            ? +8.0 * Math.pow(t, 4.0)
            : -8.0 * Math.pow(t - 1.0, 4.0) + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
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

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    // return random value from the array
    function ra(array) {
      return array[Math.floor(Math.random() * array.length)];
    }

    // return random value from weighted array
    function rw(object) {
      const array = [];
      for (const key in object) {
        for (let i=0; i < object[key]; i++) {
          array.push(key);
        }
      }  return array[Math.floor(Math.random() * array.length)];
    }

    // probability shorthand
    function P(probability) {
      return Math.random() < probability;
    }

    const options = defineInitialOptions();
    const size = writable(options.size);
    const grad = writable(options.grad);
    const diaper = writable(options.diaper);
    const shield = writable(options.shield);
    const colors = writable(options.colors);
    const background = writable(options.background);
    const scale = writable(options.scale);
    const border = writable(options.border);
    const borderWidth = writable(options.borderWidth);
    const grid = writable(options.grid);

    const history = writable([]);
    const matrices = writable([[]]);
    const matrix = writable(0);
    const state = writable({edit:0, about:0});

    const createChangesTracker = () => {
      const {subscribe, set, update} = writable([undefined, -1]);
      let history = [], position = -1;

      return {
        subscribe,

        length: () => history.length,

        reset: () => {
          history = [], position = -1;
          set([undefined, -1]);
        },

        add(value) {
          if (value === history[position]) return; // no change
          if (position < history.length - 1) history = history.slice(0, position + 1); // cut future history
          history.push(value);
          position += 1;
          set([history[position], position]);
        },

        undo: () => update(p => {
          if (position > 0) position -= 1;
          return [history[position], position];
        }),

        redo: () => update(p => {
          if (position < history.length - 1) position += 1;
          return [history[position], position];
        }),

        toString: () => `value: ${history}; position: ${position}`
      }
    };
    const changes = createChangesTracker();

    const loadedCharges = writable([]);
    const patterns = writable([]);

    function defineInitialOptions() {
      const stored = v => localStorage.getItem(v);
      const storedObj = v => localStorage.getItem(v) ? JSON.parse(localStorage.getItem(v)) : null;

      const size = +stored("size") || 200;
      const diaper = stored("diaper") || "nourse";
      const grad = stored("grad") || ra(["luster", "spotlight", "backlight"]);
      const shield = stored("shield") || rw({heater:60, oldFrench:20, spanish:30, french:5, swiss:2, wedged:2, italian:1, renaissance:1, baroque:1, polish:1, round:1, square:1, vesicaPiscis:1});
      const colors = storedObj("colors") || {argent: "#fafafa", or: "#ffe066", gules: "#d7374a", sable: "#333333", azure: "#377cd7", vert: "#26c061", purpure: "#522d5b"};
      const border = stored("border") || "#333333";
      const borderWidth = +stored("borderWidth") || 1;
      const background = stored("background") || "#333333";
      const scale = +stored("scale") || 2;
      const grid = +stored("grid") || 20;

      return {size, diaper, grad, shield, colors, border, borderWidth, background, scale, grid};
    }

    async function download(i) {
      const coas = i ? [document.getElementById("coa"+i)] : document.querySelectorAll("svg.coa");
      let width = +coas[0].getAttribute("width");
      let height = +coas[0].getAttribute("height");
      const numberX = coas.length > 1 ? Math.floor(window.innerWidth / width) : 1;
      const numberY = coas.length > 1 ? Math.ceil(coas.length / numberX) : 1;

      const scaleValue = get_store_value(scale);
      width = Math.round(width * scaleValue);
      height = Math.round(height * scaleValue);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width * numberX;
      canvas.height = height * numberY;
      ctx.fillStyle = get_store_value(background);
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let loaded = 0;
      coas.forEach(async function(svg, i) {
        const url = await getURL(svg);
        const img = new Image();
        img.src = url;
        img.onload = () => {
          URL.revokeObjectURL(url);
          ctx.drawImage(img, i % numberX * width, Math.floor(i / numberX) * height, width, height);
          loaded ++;
          if (loaded === coas.length) drawCanvas(canvas);
        };
      });
    }

    async function getURL(svg) {
      const clone = svg.cloneNode(true); // clone svg
      const d = clone.getElementsByTagName("defs")[0];

      const sh = get_store_value(shield), gr = get_store_value(grad), di = get_store_value(diaper);
      d.insertAdjacentHTML("beforeend", defs.getElementById(sh).outerHTML);
      if (gr) d.insertAdjacentHTML("beforeend", defs.getElementById(gr).outerHTML);
      if (di) d.insertAdjacentHTML("beforeend", defs.getElementById(di).outerHTML);
      clone.querySelectorAll(".charge[charge]").forEach(el => {
        const charge = el.getAttribute("charge");
        d.insertAdjacentHTML("beforeend", defs.getElementById(charge).outerHTML);
      });
      const fieldPattern = clone.getElementById("field").getAttribute("fill").split("(#")[1]?.split(")")[0];
      if (fieldPattern) d.insertAdjacentHTML("beforeend", document.getElementById(fieldPattern).outerHTML);
      const divisionPattern = clone.getElementById("division")?.querySelector("rect").getAttribute("fill").split("(#")[1]?.split(")")[0];
      if (divisionPattern) d.insertAdjacentHTML("beforeend", document.getElementById(divisionPattern).outerHTML);

      const serialized = (new XMLSerializer()).serializeToString(clone);
      const blob = new Blob([serialized], {type: 'image/svg+xml;charset=utf-8'});
      const url = window.URL.createObjectURL(blob);
      return url;
    }

    function drawCanvas(canvas) {
      const link = document.createElement("a");
      link.download = "armoria_download.png";
      canvas.toBlob(function(blob) {
        console.log(blob);
        link.href = window.URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        setTimeout(function() {
          canvas.remove();
          window.URL.revokeObjectURL(link.href);
        }, 5000);
      });
    }

    /* src\Navbar.svelte generated by Svelte v3.29.4 */

    const file$2 = "src\\Navbar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[48] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[51] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[54] = list[i];
    	child_ctx[56] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[57] = list[i];
    	child_ctx[58] = list;
    	child_ctx[59] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[60] = list[i];
    	return child_ctx;
    }

    // (47:4) {:else}
    function create_else_block_2(ctx) {
    	let bd;

    	const block = {
    		c: function create() {
    			bd = element("bd");
    			bd.textContent = "Rollback";
    			set_style(bd, "color", "#333");
    			attr_dev(bd, "class", "svelte-1v39vtw");
    			add_location(bd, file$2, 47, 6, 2052);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bd, anchor);
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
    		source: "(47:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (45:4) {#if $matrix}
    function create_if_block_7(ctx) {
    	let bt;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			bt.textContent = "Rollback";
    			attr_dev(bt, "class", "svelte-1v39vtw");
    			add_location(bt, file$2, 45, 6, 1984);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);

    			if (!mounted) {
    				dispose = listen_dev(bt, "click", /*click_handler*/ ctx[21], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(45:4) {#if $matrix}",
    		ctx
    	});

    	return block;
    }

    // (58:12) {#each sizes as s}
    function create_each_block_4(ctx) {
    	let bt;
    	let t_value = /*s*/ ctx[60][1] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[24](/*s*/ ctx[60], ...args);
    	}

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			t = text(t_value);
    			attr_dev(bt, "class", "svelte-1v39vtw");
    			toggle_class(bt, "selected", /*$size*/ ctx[1] == /*s*/ ctx[60][0]);
    			add_location(bt, file$2, 58, 14, 2410);
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

    			if (dirty[0] & /*$size, sizes*/ 32770) {
    				toggle_class(bt, "selected", /*$size*/ ctx[1] == /*s*/ ctx[60][0]);
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
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(58:12) {#each sizes as s}",
    		ctx
    	});

    	return block;
    }

    // (64:12) <Tooltip tip="Gallery size">
    function create_default_slot_12(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Gallery");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(64:12) <Tooltip tip=\\\"Gallery size\\\">",
    		ctx
    	});

    	return block;
    }

    // (72:16) {#if $colors[t] !== defaultColors[t]}
    function create_if_block_6(ctx) {
    	let tooltip;
    	let current;

    	tooltip = new Tooltip({
    			props: {
    				tip: "Restore default color",
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tooltip.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tooltip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tooltip_changes = {};

    			if (dirty[0] & /*$colors*/ 32 | dirty[2] & /*$$scope*/ 2) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tooltip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(72:16) {#if $colors[t] !== defaultColors[t]}",
    		ctx
    	});

    	return block;
    }

    // (73:18) <Tooltip tip="Restore default color">
    function create_default_slot_11(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[25](/*t*/ ctx[57], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "⭯";
    			attr_dev(span, "class", "svelte-1v39vtw");
    			add_location(span, file$2, 73, 20, 2932);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler_4, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(73:18) <Tooltip tip=\\\"Restore default color\\\">",
    		ctx
    	});

    	return block;
    }

    // (70:12) {#each tinctures as t}
    function create_each_block_3(ctx) {
    	let bl;
    	let t0_value = /*t*/ ctx[57] + "";
    	let t0;
    	let t1;
    	let t2;
    	let input;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*$colors*/ ctx[5][/*t*/ ctx[57]] !== /*defaultColors*/ ctx[19][/*t*/ ctx[57]] && create_if_block_6(ctx);

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[26].call(input, /*t*/ ctx[57]);
    	}

    	const block = {
    		c: function create() {
    			bl = element("bl");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			attr_dev(input, "type", "color");
    			attr_dev(input, "class", "svelte-1v39vtw");
    			add_location(input, file$2, 76, 16, 3065);
    			attr_dev(bl, "class", "svelte-1v39vtw");
    			add_location(bl, file$2, 70, 14, 2791);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bl, anchor);
    			append_dev(bl, t0);
    			append_dev(bl, t1);
    			if (if_block) if_block.m(bl, null);
    			append_dev(bl, t2);
    			append_dev(bl, input);
    			set_input_value(input, /*$colors*/ ctx[5][/*t*/ ctx[57]]);
    			append_dev(bl, t3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*$colors*/ ctx[5][/*t*/ ctx[57]] !== /*defaultColors*/ ctx[19][/*t*/ ctx[57]]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*$colors*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(bl, t2);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*$colors, tinctures*/ 262176) {
    				set_input_value(input, /*$colors*/ ctx[5][/*t*/ ctx[57]]);
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
    			if (detaching) detach_dev(bl);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(70:12) {#each tinctures as t}",
    		ctx
    	});

    	return block;
    }

    // (83:12) <Tooltip tip="Hue of tinctures and metals. Edit COA to change tincture or metal itself">
    function create_default_slot_10(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Colors");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(83:12) <Tooltip tip=\\\"Hue of tinctures and metals. Edit COA to change tincture or metal itself\\\">",
    		ctx
    	});

    	return block;
    }

    // (89:12) {#each shields as sh, i}
    function create_each_block_2(ctx) {
    	let bt;
    	let svg;
    	let raw_value = /*paths*/ ctx[14][/*i*/ ctx[56]] + "";
    	let t0;
    	let t1_value = /*sh*/ ctx[54].split(/(?=[A-Z])/).join(" ") + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler_5(...args) {
    		return /*click_handler_5*/ ctx[27](/*sh*/ ctx[54], ...args);
    	}

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			svg = svg_element("svg");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(svg, "width", "26");
    			attr_dev(svg, "height", "26");
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			attr_dev(svg, "class", "svelte-1v39vtw");
    			toggle_class(svg, "selected", /*sh*/ ctx[54] === /*$shield*/ ctx[4]);
    			add_location(svg, file$2, 90, 16, 3567);
    			attr_dev(bt, "class", "svelte-1v39vtw");
    			add_location(bt, file$2, 89, 14, 3515);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);
    			append_dev(bt, svg);
    			svg.innerHTML = raw_value;
    			append_dev(bt, t0);
    			append_dev(bt, t1);
    			append_dev(bt, t2);

    			if (!mounted) {
    				dispose = listen_dev(bt, "click", click_handler_5, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*shields, $shield*/ 8208) {
    				toggle_class(svg, "selected", /*sh*/ ctx[54] === /*$shield*/ ctx[4]);
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
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(89:12) {#each shields as sh, i}",
    		ctx
    	});

    	return block;
    }

    // (98:12) <Tooltip tip="Shield or banner form. Some forms do not work well with auto-generated heralrdy">
    function create_default_slot_9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Shield");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(98:12) <Tooltip tip=\\\"Shield or banner form. Some forms do not work well with auto-generated heralrdy\\\">",
    		ctx
    	});

    	return block;
    }

    // (105:12) {#each gradients as g}
    function create_each_block_1(ctx) {
    	let bt;
    	let t_value = /*g*/ ctx[51] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_7(...args) {
    		return /*click_handler_7*/ ctx[29](/*g*/ ctx[51], ...args);
    	}

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			t = text(t_value);
    			attr_dev(bt, "class", "svelte-1v39vtw");
    			toggle_class(bt, "selected", /*g*/ ctx[51] === /*$grad*/ ctx[2]);
    			add_location(bt, file$2, 105, 14, 4200);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);
    			append_dev(bt, t);

    			if (!mounted) {
    				dispose = listen_dev(bt, "click", click_handler_7, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*gradients, $grad*/ 65540) {
    				toggle_class(bt, "selected", /*g*/ ctx[51] === /*$grad*/ ctx[2]);
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(105:12) {#each gradients as g}",
    		ctx
    	});

    	return block;
    }

    // (111:12) <Tooltip tip="Gradient (overlay) style to be applied over coat of arms">
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Gradient");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(111:12) <Tooltip tip=\\\"Gradient (overlay) style to be applied over coat of arms\\\">",
    		ctx
    	});

    	return block;
    }

    // (118:12) {#each diapers as d}
    function create_each_block(ctx) {
    	let bt;
    	let t_value = /*d*/ ctx[48] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_9(...args) {
    		return /*click_handler_9*/ ctx[31](/*d*/ ctx[48], ...args);
    	}

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			t = text(t_value);
    			attr_dev(bt, "class", "svelte-1v39vtw");
    			toggle_class(bt, "selected", /*d*/ ctx[48] === /*$diaper*/ ctx[3]);
    			add_location(bt, file$2, 118, 14, 4707);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);
    			append_dev(bt, t);

    			if (!mounted) {
    				dispose = listen_dev(bt, "click", click_handler_9, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*diapers, $diaper*/ 131080) {
    				toggle_class(bt, "selected", /*d*/ ctx[48] === /*$diaper*/ ctx[3]);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(118:12) {#each diapers as d}",
    		ctx
    	});

    	return block;
    }

    // (124:12) <Tooltip tip="Diaper (subtle backing on coat of arms) style">
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Damasking");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(124:12) <Tooltip tip=\\\"Diaper (subtle backing on coat of arms) style\\\">",
    		ctx
    	});

    	return block;
    }

    // (130:14) {#if $border !== "#333333"}
    function create_if_block_5(ctx) {
    	let tooltip;
    	let current;

    	tooltip = new Tooltip({
    			props: {
    				tip: "Restore default color",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tooltip.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tooltip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tooltip_changes = {};

    			if (dirty[0] & /*$border*/ 256 | dirty[2] & /*$$scope*/ 2) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tooltip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(130:14) {#if $border !== \\\"#333333\\\"}",
    		ctx
    	});

    	return block;
    }

    // (131:16) <Tooltip tip="Restore default color">
    function create_default_slot_6(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "⭯";
    			attr_dev(span, "class", "svelte-1v39vtw");
    			add_location(span, file$2, 131, 18, 5198);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler_10*/ ctx[32], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(131:16) <Tooltip tip=\\\"Restore default color\\\">",
    		ctx
    	});

    	return block;
    }

    // (143:12) <Tooltip tip="Border style for coat of arms">
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Border");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(143:12) <Tooltip tip=\\\"Border style for coat of arms\\\">",
    		ctx
    	});

    	return block;
    }

    // (156:12) <Tooltip tip="Edit mode grid size (affects elements dragging)">
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Grid");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(156:12) <Tooltip tip=\\\"Edit mode grid size (affects elements dragging)\\\">",
    		ctx
    	});

    	return block;
    }

    // (163:14) <Tooltip tip="Select random color">
    function create_default_slot_3(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "⭮";
    			attr_dev(span, "class", "svelte-1v39vtw");
    			add_location(span, file$2, 163, 16, 6325);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*getRandomColor*/ ctx[20], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(163:14) <Tooltip tip=\\\"Select random color\\\">",
    		ctx
    	});

    	return block;
    }

    // (166:14) {#if $background !== "#333333"}
    function create_if_block_4(ctx) {
    	let tooltip;
    	let current;

    	tooltip = new Tooltip({
    			props: {
    				tip: "Restore default color",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tooltip.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tooltip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tooltip_changes = {};

    			if (dirty[0] & /*$background*/ 64 | dirty[2] & /*$$scope*/ 2) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tooltip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(166:14) {#if $background !== \\\"#333333\\\"}",
    		ctx
    	});

    	return block;
    }

    // (167:16) <Tooltip tip="Restore default color">
    function create_default_slot_2(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "⭯";
    			attr_dev(span, "class", "svelte-1v39vtw");
    			add_location(span, file$2, 167, 18, 6514);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler_11*/ ctx[37], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(167:16) <Tooltip tip=\\\"Restore default color\\\">",
    		ctx
    	});

    	return block;
    }

    // (176:12) <Tooltip tip="Background color">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Background");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(176:12) <Tooltip tip=\\\"Background color\\\">",
    		ctx
    	});

    	return block;
    }

    // (189:12) <Tooltip tip="Downloaded image size, 1 is default size, 2 - 2x size, etc.">
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Scale");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(189:12) <Tooltip tip=\\\"Downloaded image size, 1 is default size, 2 - 2x size, etc.\\\">",
    		ctx
    	});

    	return block;
    }

    // (195:4) {#if $state.edit}
    function create_if_block_1(ctx) {
    	let t;
    	let show_if;
    	let if_block1_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*position*/ ctx[0] > 0) return create_if_block_3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (show_if == null || dirty[0] & /*position*/ 1) show_if = !!(/*position*/ ctx[0] < changes.length() - 1);
    		if (show_if) return create_if_block_2;
    		return create_else_block$1;
    	}

    	let current_block_type_1 = select_block_type_2(ctx, [-1]);
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(195:4) {#if $state.edit}",
    		ctx
    	});

    	return block;
    }

    // (198:6) {:else}
    function create_else_block_1(ctx) {
    	let bd;

    	const block = {
    		c: function create() {
    			bd = element("bd");
    			bd.textContent = "Undo";
    			set_style(bd, "color", "#333");
    			attr_dev(bd, "class", "svelte-1v39vtw");
    			add_location(bd, file$2, 198, 8, 7513);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bd, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bd);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(198:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (196:6) {#if position > 0}
    function create_if_block_3(ctx) {
    	let bt;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			bt.textContent = "Undo";
    			attr_dev(bt, "class", "svelte-1v39vtw");
    			add_location(bt, file$2, 196, 8, 7443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);

    			if (!mounted) {
    				dispose = listen_dev(bt, "click", /*click_handler_12*/ ctx[41], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(196:6) {#if position > 0}",
    		ctx
    	});

    	return block;
    }

    // (204:6) {:else}
    function create_else_block$1(ctx) {
    	let bd;

    	const block = {
    		c: function create() {
    			bd = element("bd");
    			bd.textContent = "Redo";
    			set_style(bd, "color", "#333");
    			attr_dev(bd, "class", "svelte-1v39vtw");
    			add_location(bd, file$2, 204, 8, 7686);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bd, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bd);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(204:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:6) {#if position < changes.length() - 1}
    function create_if_block_2(ctx) {
    	let bt;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			bt.textContent = "Redo";
    			attr_dev(bt, "class", "svelte-1v39vtw");
    			add_location(bt, file$2, 202, 8, 7616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);

    			if (!mounted) {
    				dispose = listen_dev(bt, "click", /*click_handler_13*/ ctx[42], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bt);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(202:6) {#if position < changes.length() - 1}",
    		ctx
    	});

    	return block;
    }

    // (209:4) {#if $state.edit}
    function create_if_block$2(ctx) {
    	let bt;
    	let bt_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			bt = element("bt");
    			bt.textContent = "Back to gallery";
    			attr_dev(bt, "id", "back");
    			attr_dev(bt, "class", "svelte-1v39vtw");
    			add_location(bt, file$2, 209, 6, 7776);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bt, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(bt, "click", /*click_handler_14*/ ctx[43], false, false, false);
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
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(209:4) {#if $state.edit}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div20;
    	let ul;
    	let bd;
    	let img;
    	let img_src_value;
    	let b;
    	let t1;
    	let t2;
    	let bt0;
    	let t4;
    	let bt1;
    	let t6;
    	let div19;
    	let bl0;
    	let t8;
    	let div18;
    	let div1;
    	let div0;
    	let t9;
    	let bl1;
    	let lock0;
    	let t10;
    	let tooltip0;
    	let t11;
    	let div3;
    	let div2;
    	let t12;
    	let bl2;
    	let lock1;
    	let t13;
    	let tooltip1;
    	let t14;
    	let div5;
    	let div4;
    	let t15;
    	let bl3;
    	let lock2;
    	let t16;
    	let tooltip2;
    	let t17;
    	let div7;
    	let div6;
    	let bt2;
    	let t19;
    	let t20;
    	let bl4;
    	let lock3;
    	let t21;
    	let tooltip3;
    	let t22;
    	let div9;
    	let div8;
    	let bt3;
    	let t24;
    	let t25;
    	let bl5;
    	let lock4;
    	let t26;
    	let tooltip4;
    	let t27;
    	let div11;
    	let div10;
    	let bl6;
    	let t28;
    	let t29;
    	let input0;
    	let t30;
    	let bl7;
    	let t31;
    	let input1;
    	let t32;
    	let bl8;
    	let lock5;
    	let t33;
    	let tooltip5;
    	let t34;
    	let div13;
    	let div12;
    	let bl9;
    	let input2;
    	let t35;
    	let input3;
    	let t36;
    	let bl10;
    	let lock6;
    	let t37;
    	let tooltip6;
    	let t38;
    	let div15;
    	let div14;
    	let bl11;
    	let t39;
    	let tooltip7;
    	let t40;
    	let t41;
    	let input4;
    	let t42;
    	let bl12;
    	let lock7;
    	let t43;
    	let tooltip8;
    	let t44;
    	let div17;
    	let div16;
    	let bl13;
    	let input5;
    	let t45;
    	let input6;
    	let t46;
    	let bl14;
    	let lock8;
    	let t47;
    	let tooltip9;
    	let t48;
    	let t49;
    	let t50;
    	let bt4;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*$matrix*/ ctx[11]) return create_if_block_7;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let each_value_4 = /*sizes*/ ctx[15];
    	validate_each_argument(each_value_4);
    	let each_blocks_4 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_4[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	lock0 = new Lock({ props: { key: "size" }, $$inline: true });

    	tooltip0 = new Tooltip({
    			props: {
    				tip: "Gallery size",
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value_3 = /*tinctures*/ ctx[18];
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const out = i => transition_out(each_blocks_3[i], 1, 1, () => {
    		each_blocks_3[i] = null;
    	});

    	lock1 = new Lock({ props: { key: "colors" }, $$inline: true });

    	tooltip1 = new Tooltip({
    			props: {
    				tip: "Hue of tinctures and metals. Edit COA to change tincture or metal itself",
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value_2 = /*shields*/ ctx[13];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	lock2 = new Lock({ props: { key: "shield" }, $$inline: true });

    	tooltip2 = new Tooltip({
    			props: {
    				tip: "Shield or banner form. Some forms do not work well with auto-generated heralrdy",
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value_1 = /*gradients*/ ctx[16];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	lock3 = new Lock({ props: { key: "grad" }, $$inline: true });

    	tooltip3 = new Tooltip({
    			props: {
    				tip: "Gradient (overlay) style to be applied over coat of arms",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = /*diapers*/ ctx[17];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	lock4 = new Lock({ props: { key: "diaper" }, $$inline: true });

    	tooltip4 = new Tooltip({
    			props: {
    				tip: "Diaper (subtle backing on coat of arms) style",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block1 = /*$border*/ ctx[8] !== "#333333" && create_if_block_5(ctx);
    	lock5 = new Lock({ props: { key: "border" }, $$inline: true });

    	tooltip5 = new Tooltip({
    			props: {
    				tip: "Border style for coat of arms",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	lock6 = new Lock({ props: { key: "grid" }, $$inline: true });

    	tooltip6 = new Tooltip({
    			props: {
    				tip: "Edit mode grid size (affects elements dragging)",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tooltip7 = new Tooltip({
    			props: {
    				tip: "Select random color",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block2 = /*$background*/ ctx[6] !== "#333333" && create_if_block_4(ctx);

    	lock7 = new Lock({
    			props: { key: "background" },
    			$$inline: true
    		});

    	tooltip8 = new Tooltip({
    			props: {
    				tip: "Background color",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	lock8 = new Lock({ props: { key: "scale" }, $$inline: true });

    	tooltip9 = new Tooltip({
    			props: {
    				tip: "Downloaded image size, 1 is default size, 2 - 2x size, etc.",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block3 = /*$state*/ ctx[12].edit && create_if_block_1(ctx);
    	let if_block4 = /*$state*/ ctx[12].edit && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div20 = element("div");
    			ul = element("ul");
    			bd = element("bd");
    			img = element("img");
    			b = element("b");
    			b.textContent = "Armoria";
    			t1 = space();
    			if_block0.c();
    			t2 = space();
    			bt0 = element("bt");
    			bt0.textContent = "Reroll";
    			t4 = space();
    			bt1 = element("bt");
    			bt1.textContent = "Download";
    			t6 = space();
    			div19 = element("div");
    			bl0 = element("bl");
    			bl0.textContent = "Options";
    			t8 = space();
    			div18 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			t9 = space();
    			bl1 = element("bl");
    			create_component(lock0.$$.fragment);
    			t10 = space();
    			create_component(tooltip0.$$.fragment);
    			t11 = space();
    			div3 = element("div");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t12 = space();
    			bl2 = element("bl");
    			create_component(lock1.$$.fragment);
    			t13 = space();
    			create_component(tooltip1.$$.fragment);
    			t14 = space();
    			div5 = element("div");
    			div4 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t15 = space();
    			bl3 = element("bl");
    			create_component(lock2.$$.fragment);
    			t16 = space();
    			create_component(tooltip2.$$.fragment);
    			t17 = space();
    			div7 = element("div");
    			div6 = element("div");
    			bt2 = element("bt");
    			bt2.textContent = "No gradient";
    			t19 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t20 = space();
    			bl4 = element("bl");
    			create_component(lock3.$$.fragment);
    			t21 = space();
    			create_component(tooltip3.$$.fragment);
    			t22 = space();
    			div9 = element("div");
    			div8 = element("div");
    			bt3 = element("bt");
    			bt3.textContent = "No pattern";
    			t24 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t25 = space();
    			bl5 = element("bl");
    			create_component(lock4.$$.fragment);
    			t26 = space();
    			create_component(tooltip4.$$.fragment);
    			t27 = space();
    			div11 = element("div");
    			div10 = element("div");
    			bl6 = element("bl");
    			t28 = text("Color\r\n              ");
    			if (if_block1) if_block1.c();
    			t29 = space();
    			input0 = element("input");
    			t30 = space();
    			bl7 = element("bl");
    			t31 = text("Width\r\n              ");
    			input1 = element("input");
    			t32 = space();
    			bl8 = element("bl");
    			create_component(lock5.$$.fragment);
    			t33 = space();
    			create_component(tooltip5.$$.fragment);
    			t34 = space();
    			div13 = element("div");
    			div12 = element("div");
    			bl9 = element("bl");
    			input2 = element("input");
    			t35 = space();
    			input3 = element("input");
    			t36 = space();
    			bl10 = element("bl");
    			create_component(lock6.$$.fragment);
    			t37 = space();
    			create_component(tooltip6.$$.fragment);
    			t38 = space();
    			div15 = element("div");
    			div14 = element("div");
    			bl11 = element("bl");
    			t39 = text("Color\r\n              ");
    			create_component(tooltip7.$$.fragment);
    			t40 = space();
    			if (if_block2) if_block2.c();
    			t41 = space();
    			input4 = element("input");
    			t42 = space();
    			bl12 = element("bl");
    			create_component(lock7.$$.fragment);
    			t43 = space();
    			create_component(tooltip8.$$.fragment);
    			t44 = space();
    			div17 = element("div");
    			div16 = element("div");
    			bl13 = element("bl");
    			input5 = element("input");
    			t45 = space();
    			input6 = element("input");
    			t46 = space();
    			bl14 = element("bl");
    			create_component(lock8.$$.fragment);
    			t47 = space();
    			create_component(tooltip9.$$.fragment);
    			t48 = space();
    			if (if_block3) if_block3.c();
    			t49 = space();
    			if (if_block4) if_block4.c();
    			t50 = space();
    			bt4 = element("bt");
    			bt4.textContent = "About";
    			attr_dev(img, "alt", "Armoria");
    			if (img.src !== (img_src_value = "../logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1v39vtw");
    			add_location(img, file$2, 43, 8, 1901);
    			add_location(b, file$2, 43, 45, 1938);
    			attr_dev(bd, "class", "svelte-1v39vtw");
    			add_location(bd, file$2, 43, 4, 1897);
    			attr_dev(bt0, "class", "svelte-1v39vtw");
    			add_location(bt0, file$2, 49, 4, 2106);
    			attr_dev(bt1, "class", "svelte-1v39vtw");
    			add_location(bt1, file$2, 51, 4, 2159);
    			attr_dev(bl0, "class", "svelte-1v39vtw");
    			add_location(bl0, file$2, 52, 27, 2233);
    			attr_dev(div0, "class", "dropdown level2 svelte-1v39vtw");
    			add_location(div0, file$2, 56, 10, 2333);
    			attr_dev(bl1, "class", "svelte-1v39vtw");
    			add_location(bl1, file$2, 61, 10, 2537);
    			attr_dev(div1, "class", "container svelte-1v39vtw");
    			add_location(div1, file$2, 55, 8, 2298);
    			attr_dev(div2, "class", "dropdown level2 svelte-1v39vtw");
    			add_location(div2, file$2, 68, 10, 2710);
    			attr_dev(bl2, "class", "svelte-1v39vtw");
    			add_location(bl2, file$2, 80, 10, 3182);
    			attr_dev(div3, "class", "container svelte-1v39vtw");
    			add_location(div3, file$2, 67, 8, 2675);
    			attr_dev(div4, "class", "dropdown level2 columns3 iconed svelte-1v39vtw");
    			add_location(div4, file$2, 87, 10, 3416);
    			attr_dev(bl3, "class", "svelte-1v39vtw");
    			add_location(bl3, file$2, 95, 10, 3790);
    			attr_dev(div5, "class", "container svelte-1v39vtw");
    			add_location(div5, file$2, 86, 8, 3381);
    			attr_dev(bt2, "class", "svelte-1v39vtw");
    			toggle_class(bt2, "selected", !/*$grad*/ ctx[2]);
    			add_location(bt2, file$2, 103, 12, 4074);
    			attr_dev(div6, "class", "dropdown level2 svelte-1v39vtw");
    			add_location(div6, file$2, 102, 10, 4031);
    			attr_dev(bl4, "class", "svelte-1v39vtw");
    			add_location(bl4, file$2, 108, 10, 4319);
    			attr_dev(div7, "class", "container svelte-1v39vtw");
    			add_location(div7, file$2, 101, 8, 3996);
    			attr_dev(bt3, "class", "svelte-1v39vtw");
    			toggle_class(bt3, "selected", !/*$diaper*/ ctx[3]);
    			add_location(bt3, file$2, 116, 12, 4580);
    			attr_dev(div8, "class", "dropdown level2 svelte-1v39vtw");
    			add_location(div8, file$2, 115, 10, 4537);
    			attr_dev(bl5, "class", "svelte-1v39vtw");
    			add_location(bl5, file$2, 121, 10, 4830);
    			attr_dev(div9, "class", "container svelte-1v39vtw");
    			add_location(div9, file$2, 114, 8, 4502);
    			attr_dev(input0, "type", "color");
    			attr_dev(input0, "class", "svelte-1v39vtw");
    			add_location(input0, file$2, 134, 14, 5315);
    			attr_dev(bl6, "class", "svelte-1v39vtw");
    			add_location(bl6, file$2, 128, 12, 5071);
    			attr_dev(input1, "class", "right svelte-1v39vtw");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "4");
    			attr_dev(input1, "step", ".1");
    			add_location(input1, file$2, 137, 14, 5415);
    			attr_dev(bl7, "class", "svelte-1v39vtw");
    			add_location(bl7, file$2, 136, 12, 5390);
    			attr_dev(div10, "class", "dropdown level2 svelte-1v39vtw");
    			add_location(div10, file$2, 127, 10, 5028);
    			attr_dev(bl8, "class", "svelte-1v39vtw");
    			add_location(bl8, file$2, 140, 10, 5546);
    			attr_dev(div11, "class", "container svelte-1v39vtw");
    			add_location(div11, file$2, 126, 8, 4993);
    			attr_dev(input2, "type", "range");
    			attr_dev(input2, "min", "1");
    			attr_dev(input2, "max", "50");
    			attr_dev(input2, "step", "1");
    			attr_dev(input2, "class", "svelte-1v39vtw");
    			add_location(input2, file$2, 149, 14, 5813);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "min", "1");
    			attr_dev(input3, "max", "50");
    			attr_dev(input3, "step", "1");
    			attr_dev(input3, "class", "svelte-1v39vtw");
    			add_location(input3, file$2, 150, 14, 5889);
    			attr_dev(bl9, "class", "wide svelte-1v39vtw");
    			add_location(bl9, file$2, 148, 12, 5780);
    			attr_dev(div12, "class", "dropdown level2 svelte-1v39vtw");
    			add_location(div12, file$2, 147, 10, 5737);
    			attr_dev(bl10, "class", "svelte-1v39vtw");
    			add_location(bl10, file$2, 153, 10, 5999);
    			attr_dev(div13, "class", "container svelte-1v39vtw");
    			add_location(div13, file$2, 146, 8, 5702);
    			attr_dev(input4, "type", "color");
    			attr_dev(input4, "class", "svelte-1v39vtw");
    			add_location(input4, file$2, 170, 14, 6635);
    			attr_dev(bl11, "class", "svelte-1v39vtw");
    			add_location(bl11, file$2, 161, 12, 6247);
    			attr_dev(div14, "class", "dropdown level2 svelte-1v39vtw");
    			add_location(div14, file$2, 160, 10, 6204);
    			attr_dev(bl12, "class", "svelte-1v39vtw");
    			add_location(bl12, file$2, 173, 10, 6730);
    			attr_dev(div15, "class", "container svelte-1v39vtw");
    			add_location(div15, file$2, 159, 8, 6169);
    			attr_dev(input5, "type", "range");
    			attr_dev(input5, "min", "1");
    			attr_dev(input5, "max", "4");
    			attr_dev(input5, "step", ".1");
    			attr_dev(input5, "class", "svelte-1v39vtw");
    			add_location(input5, file$2, 182, 14, 6992);
    			attr_dev(input6, "type", "number");
    			attr_dev(input6, "min", "1");
    			attr_dev(input6, "max", "4");
    			attr_dev(input6, "step", ".1");
    			attr_dev(input6, "class", "svelte-1v39vtw");
    			add_location(input6, file$2, 183, 14, 7069);
    			attr_dev(bl13, "class", "wide svelte-1v39vtw");
    			add_location(bl13, file$2, 181, 12, 6959);
    			attr_dev(div16, "class", "dropdown level2 svelte-1v39vtw");
    			add_location(div16, file$2, 180, 10, 6916);
    			attr_dev(bl14, "class", "svelte-1v39vtw");
    			add_location(bl14, file$2, 186, 10, 7180);
    			attr_dev(div17, "class", "container svelte-1v39vtw");
    			add_location(div17, file$2, 179, 8, 6881);
    			attr_dev(div18, "class", "dropdown level1 svelte-1v39vtw");
    			add_location(div18, file$2, 54, 6, 2259);
    			attr_dev(div19, "class", "container svelte-1v39vtw");
    			add_location(div19, file$2, 52, 4, 2210);
    			attr_dev(bt4, "class", "svelte-1v39vtw");
    			add_location(bt4, file$2, 212, 4, 7878);
    			attr_dev(ul, "class", "svelte-1v39vtw");
    			add_location(ul, file$2, 42, 2, 1887);
    			attr_dev(div20, "id", "navbar");
    			add_location(div20, file$2, 41, 0, 1866);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div20, anchor);
    			append_dev(div20, ul);
    			append_dev(ul, bd);
    			append_dev(bd, img);
    			append_dev(bd, b);
    			append_dev(ul, t1);
    			if_block0.m(ul, null);
    			append_dev(ul, t2);
    			append_dev(ul, bt0);
    			append_dev(ul, t4);
    			append_dev(ul, bt1);
    			append_dev(ul, t6);
    			append_dev(ul, div19);
    			append_dev(div19, bl0);
    			append_dev(div19, t8);
    			append_dev(div19, div18);
    			append_dev(div18, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].m(div0, null);
    			}

    			append_dev(div1, t9);
    			append_dev(div1, bl1);
    			mount_component(lock0, bl1, null);
    			append_dev(bl1, t10);
    			mount_component(tooltip0, bl1, null);
    			append_dev(div18, t11);
    			append_dev(div18, div3);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div2, null);
    			}

    			append_dev(div3, t12);
    			append_dev(div3, bl2);
    			mount_component(lock1, bl2, null);
    			append_dev(bl2, t13);
    			mount_component(tooltip1, bl2, null);
    			append_dev(div18, t14);
    			append_dev(div18, div5);
    			append_dev(div5, div4);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div4, null);
    			}

    			append_dev(div5, t15);
    			append_dev(div5, bl3);
    			mount_component(lock2, bl3, null);
    			append_dev(bl3, t16);
    			mount_component(tooltip2, bl3, null);
    			append_dev(div18, t17);
    			append_dev(div18, div7);
    			append_dev(div7, div6);
    			append_dev(div6, bt2);
    			append_dev(div6, t19);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div6, null);
    			}

    			append_dev(div7, t20);
    			append_dev(div7, bl4);
    			mount_component(lock3, bl4, null);
    			append_dev(bl4, t21);
    			mount_component(tooltip3, bl4, null);
    			append_dev(div18, t22);
    			append_dev(div18, div9);
    			append_dev(div9, div8);
    			append_dev(div8, bt3);
    			append_dev(div8, t24);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div8, null);
    			}

    			append_dev(div9, t25);
    			append_dev(div9, bl5);
    			mount_component(lock4, bl5, null);
    			append_dev(bl5, t26);
    			mount_component(tooltip4, bl5, null);
    			append_dev(div18, t27);
    			append_dev(div18, div11);
    			append_dev(div11, div10);
    			append_dev(div10, bl6);
    			append_dev(bl6, t28);
    			if (if_block1) if_block1.m(bl6, null);
    			append_dev(bl6, t29);
    			append_dev(bl6, input0);
    			set_input_value(input0, /*$border*/ ctx[8]);
    			append_dev(div10, t30);
    			append_dev(div10, bl7);
    			append_dev(bl7, t31);
    			append_dev(bl7, input1);
    			set_input_value(input1, /*$borderWidth*/ ctx[9]);
    			append_dev(div11, t32);
    			append_dev(div11, bl8);
    			mount_component(lock5, bl8, null);
    			append_dev(bl8, t33);
    			mount_component(tooltip5, bl8, null);
    			append_dev(div18, t34);
    			append_dev(div18, div13);
    			append_dev(div13, div12);
    			append_dev(div12, bl9);
    			append_dev(bl9, input2);
    			set_input_value(input2, /*$grid*/ ctx[10]);
    			append_dev(bl9, t35);
    			append_dev(bl9, input3);
    			set_input_value(input3, /*$grid*/ ctx[10]);
    			append_dev(div13, t36);
    			append_dev(div13, bl10);
    			mount_component(lock6, bl10, null);
    			append_dev(bl10, t37);
    			mount_component(tooltip6, bl10, null);
    			append_dev(div18, t38);
    			append_dev(div18, div15);
    			append_dev(div15, div14);
    			append_dev(div14, bl11);
    			append_dev(bl11, t39);
    			mount_component(tooltip7, bl11, null);
    			append_dev(bl11, t40);
    			if (if_block2) if_block2.m(bl11, null);
    			append_dev(bl11, t41);
    			append_dev(bl11, input4);
    			set_input_value(input4, /*$background*/ ctx[6]);
    			append_dev(div15, t42);
    			append_dev(div15, bl12);
    			mount_component(lock7, bl12, null);
    			append_dev(bl12, t43);
    			mount_component(tooltip8, bl12, null);
    			append_dev(div18, t44);
    			append_dev(div18, div17);
    			append_dev(div17, div16);
    			append_dev(div16, bl13);
    			append_dev(bl13, input5);
    			set_input_value(input5, /*$scale*/ ctx[7]);
    			append_dev(bl13, t45);
    			append_dev(bl13, input6);
    			set_input_value(input6, /*$scale*/ ctx[7]);
    			append_dev(div17, t46);
    			append_dev(div17, bl14);
    			mount_component(lock8, bl14, null);
    			append_dev(bl14, t47);
    			mount_component(tooltip9, bl14, null);
    			append_dev(ul, t48);
    			if (if_block3) if_block3.m(ul, null);
    			append_dev(ul, t49);
    			if (if_block4) if_block4.m(ul, null);
    			append_dev(ul, t50);
    			append_dev(ul, bt4);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(bt0, "click", /*click_handler_1*/ ctx[22], false, false, false),
    					listen_dev(bt1, "click", /*click_handler_2*/ ctx[23], false, false, false),
    					listen_dev(bt2, "click", /*click_handler_6*/ ctx[28], false, false, false),
    					listen_dev(bt3, "click", /*click_handler_8*/ ctx[30], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[33]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[34]),
    					listen_dev(input2, "change", /*input2_change_input_handler*/ ctx[35]),
    					listen_dev(input2, "input", /*input2_change_input_handler*/ ctx[35]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[36]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[38]),
    					listen_dev(input5, "change", /*input5_change_input_handler*/ ctx[39]),
    					listen_dev(input5, "input", /*input5_change_input_handler*/ ctx[39]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[40]),
    					listen_dev(bt4, "click", /*click_handler_15*/ ctx[44], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(ul, t2);
    				}
    			}

    			if (dirty[0] & /*$size, sizes*/ 32770) {
    				each_value_4 = /*sizes*/ ctx[15];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_4[i]) {
    						each_blocks_4[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_4[i] = create_each_block_4(child_ctx);
    						each_blocks_4[i].c();
    						each_blocks_4[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_4.length; i += 1) {
    					each_blocks_4[i].d(1);
    				}

    				each_blocks_4.length = each_value_4.length;
    			}

    			const tooltip0_changes = {};

    			if (dirty[2] & /*$$scope*/ 2) {
    				tooltip0_changes.$$scope = { dirty, ctx };
    			}

    			tooltip0.$set(tooltip0_changes);

    			if (dirty[0] & /*$colors, tinctures, defaultColors*/ 786464) {
    				each_value_3 = /*tinctures*/ ctx[18];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    						transition_in(each_blocks_3[i], 1);
    					} else {
    						each_blocks_3[i] = create_each_block_3(child_ctx);
    						each_blocks_3[i].c();
    						transition_in(each_blocks_3[i], 1);
    						each_blocks_3[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_3.length; i < each_blocks_3.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const tooltip1_changes = {};

    			if (dirty[2] & /*$$scope*/ 2) {
    				tooltip1_changes.$$scope = { dirty, ctx };
    			}

    			tooltip1.$set(tooltip1_changes);

    			if (dirty[0] & /*$shield, shields, paths*/ 24592) {
    				each_value_2 = /*shields*/ ctx[13];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			const tooltip2_changes = {};

    			if (dirty[2] & /*$$scope*/ 2) {
    				tooltip2_changes.$$scope = { dirty, ctx };
    			}

    			tooltip2.$set(tooltip2_changes);

    			if (dirty[0] & /*$grad*/ 4) {
    				toggle_class(bt2, "selected", !/*$grad*/ ctx[2]);
    			}

    			if (dirty[0] & /*gradients, $grad*/ 65540) {
    				each_value_1 = /*gradients*/ ctx[16];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div6, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			const tooltip3_changes = {};

    			if (dirty[2] & /*$$scope*/ 2) {
    				tooltip3_changes.$$scope = { dirty, ctx };
    			}

    			tooltip3.$set(tooltip3_changes);

    			if (dirty[0] & /*$diaper*/ 8) {
    				toggle_class(bt3, "selected", !/*$diaper*/ ctx[3]);
    			}

    			if (dirty[0] & /*diapers, $diaper*/ 131080) {
    				each_value = /*diapers*/ ctx[17];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div8, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const tooltip4_changes = {};

    			if (dirty[2] & /*$$scope*/ 2) {
    				tooltip4_changes.$$scope = { dirty, ctx };
    			}

    			tooltip4.$set(tooltip4_changes);

    			if (/*$border*/ ctx[8] !== "#333333") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*$border*/ 256) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(bl6, t29);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*$border*/ 256) {
    				set_input_value(input0, /*$border*/ ctx[8]);
    			}

    			if (dirty[0] & /*$borderWidth*/ 512 && to_number(input1.value) !== /*$borderWidth*/ ctx[9]) {
    				set_input_value(input1, /*$borderWidth*/ ctx[9]);
    			}

    			const tooltip5_changes = {};

    			if (dirty[2] & /*$$scope*/ 2) {
    				tooltip5_changes.$$scope = { dirty, ctx };
    			}

    			tooltip5.$set(tooltip5_changes);

    			if (dirty[0] & /*$grid*/ 1024) {
    				set_input_value(input2, /*$grid*/ ctx[10]);
    			}

    			if (dirty[0] & /*$grid*/ 1024 && to_number(input3.value) !== /*$grid*/ ctx[10]) {
    				set_input_value(input3, /*$grid*/ ctx[10]);
    			}

    			const tooltip6_changes = {};

    			if (dirty[2] & /*$$scope*/ 2) {
    				tooltip6_changes.$$scope = { dirty, ctx };
    			}

    			tooltip6.$set(tooltip6_changes);
    			const tooltip7_changes = {};

    			if (dirty[2] & /*$$scope*/ 2) {
    				tooltip7_changes.$$scope = { dirty, ctx };
    			}

    			tooltip7.$set(tooltip7_changes);

    			if (/*$background*/ ctx[6] !== "#333333") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*$background*/ 64) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(bl11, t41);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*$background*/ 64) {
    				set_input_value(input4, /*$background*/ ctx[6]);
    			}

    			const tooltip8_changes = {};

    			if (dirty[2] & /*$$scope*/ 2) {
    				tooltip8_changes.$$scope = { dirty, ctx };
    			}

    			tooltip8.$set(tooltip8_changes);

    			if (dirty[0] & /*$scale*/ 128) {
    				set_input_value(input5, /*$scale*/ ctx[7]);
    			}

    			if (dirty[0] & /*$scale*/ 128 && to_number(input6.value) !== /*$scale*/ ctx[7]) {
    				set_input_value(input6, /*$scale*/ ctx[7]);
    			}

    			const tooltip9_changes = {};

    			if (dirty[2] & /*$$scope*/ 2) {
    				tooltip9_changes.$$scope = { dirty, ctx };
    			}

    			tooltip9.$set(tooltip9_changes);

    			if (/*$state*/ ctx[12].edit) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_1(ctx);
    					if_block3.c();
    					if_block3.m(ul, t49);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*$state*/ ctx[12].edit) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*$state*/ 4096) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block$2(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(ul, t50);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lock0.$$.fragment, local);
    			transition_in(tooltip0.$$.fragment, local);

    			for (let i = 0; i < each_value_3.length; i += 1) {
    				transition_in(each_blocks_3[i]);
    			}

    			transition_in(lock1.$$.fragment, local);
    			transition_in(tooltip1.$$.fragment, local);
    			transition_in(lock2.$$.fragment, local);
    			transition_in(tooltip2.$$.fragment, local);
    			transition_in(lock3.$$.fragment, local);
    			transition_in(tooltip3.$$.fragment, local);
    			transition_in(lock4.$$.fragment, local);
    			transition_in(tooltip4.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(lock5.$$.fragment, local);
    			transition_in(tooltip5.$$.fragment, local);
    			transition_in(lock6.$$.fragment, local);
    			transition_in(tooltip6.$$.fragment, local);
    			transition_in(tooltip7.$$.fragment, local);
    			transition_in(if_block2);
    			transition_in(lock7.$$.fragment, local);
    			transition_in(tooltip8.$$.fragment, local);
    			transition_in(lock8.$$.fragment, local);
    			transition_in(tooltip9.$$.fragment, local);
    			transition_in(if_block4);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lock0.$$.fragment, local);
    			transition_out(tooltip0.$$.fragment, local);
    			each_blocks_3 = each_blocks_3.filter(Boolean);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				transition_out(each_blocks_3[i]);
    			}

    			transition_out(lock1.$$.fragment, local);
    			transition_out(tooltip1.$$.fragment, local);
    			transition_out(lock2.$$.fragment, local);
    			transition_out(tooltip2.$$.fragment, local);
    			transition_out(lock3.$$.fragment, local);
    			transition_out(tooltip3.$$.fragment, local);
    			transition_out(lock4.$$.fragment, local);
    			transition_out(tooltip4.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(lock5.$$.fragment, local);
    			transition_out(tooltip5.$$.fragment, local);
    			transition_out(lock6.$$.fragment, local);
    			transition_out(tooltip6.$$.fragment, local);
    			transition_out(tooltip7.$$.fragment, local);
    			transition_out(if_block2);
    			transition_out(lock7.$$.fragment, local);
    			transition_out(tooltip8.$$.fragment, local);
    			transition_out(lock8.$$.fragment, local);
    			transition_out(tooltip9.$$.fragment, local);
    			transition_out(if_block4);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div20);
    			if_block0.d();
    			destroy_each(each_blocks_4, detaching);
    			destroy_component(lock0);
    			destroy_component(tooltip0);
    			destroy_each(each_blocks_3, detaching);
    			destroy_component(lock1);
    			destroy_component(tooltip1);
    			destroy_each(each_blocks_2, detaching);
    			destroy_component(lock2);
    			destroy_component(tooltip2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_component(lock3);
    			destroy_component(tooltip3);
    			destroy_each(each_blocks, detaching);
    			destroy_component(lock4);
    			destroy_component(tooltip4);
    			if (if_block1) if_block1.d();
    			destroy_component(lock5);
    			destroy_component(tooltip5);
    			destroy_component(lock6);
    			destroy_component(tooltip6);
    			destroy_component(tooltip7);
    			if (if_block2) if_block2.d();
    			destroy_component(lock7);
    			destroy_component(tooltip8);
    			destroy_component(lock8);
    			destroy_component(tooltip9);
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
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
    	let $changes;
    	let $size;
    	let $grad;
    	let $diaper;
    	let $shield;
    	let $colors;
    	let $background;
    	let $scale;
    	let $border;
    	let $borderWidth;
    	let $grid;
    	let $matrix;
    	let $state;
    	validate_store(changes, "changes");
    	component_subscribe($$self, changes, $$value => $$invalidate(45, $changes = $$value));
    	validate_store(size, "size");
    	component_subscribe($$self, size, $$value => $$invalidate(1, $size = $$value));
    	validate_store(grad, "grad");
    	component_subscribe($$self, grad, $$value => $$invalidate(2, $grad = $$value));
    	validate_store(diaper, "diaper");
    	component_subscribe($$self, diaper, $$value => $$invalidate(3, $diaper = $$value));
    	validate_store(shield, "shield");
    	component_subscribe($$self, shield, $$value => $$invalidate(4, $shield = $$value));
    	validate_store(colors, "colors");
    	component_subscribe($$self, colors, $$value => $$invalidate(5, $colors = $$value));
    	validate_store(background, "background");
    	component_subscribe($$self, background, $$value => $$invalidate(6, $background = $$value));
    	validate_store(scale, "scale");
    	component_subscribe($$self, scale, $$value => $$invalidate(7, $scale = $$value));
    	validate_store(border, "border");
    	component_subscribe($$self, border, $$value => $$invalidate(8, $border = $$value));
    	validate_store(borderWidth, "borderWidth");
    	component_subscribe($$self, borderWidth, $$value => $$invalidate(9, $borderWidth = $$value));
    	validate_store(grid, "grid");
    	component_subscribe($$self, grid, $$value => $$invalidate(10, $grid = $$value));
    	validate_store(matrix, "matrix");
    	component_subscribe($$self, matrix, $$value => $$invalidate(11, $matrix = $$value));
    	validate_store(state, "state");
    	component_subscribe($$self, state, $$value => $$invalidate(12, $state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);

    	const shields = [
    		"heater",
    		"oldFrench",
    		"spanish",
    		"french",
    		"swiss",
    		"wedged",
    		"italian",
    		"kite",
    		"renaissance",
    		"baroque",
    		"polish",
    		"german",
    		"diamond",
    		"round",
    		"vesicaPiscis",
    		"square",
    		"flag",
    		"pennon",
    		"guidon",
    		"banner",
    		"dovetail",
    		"gonfalon",
    		"pennant"
    	];

    	const paths = shields.map(id => document.getElementById(id).innerHTML);

    	const sizes = [
    		[80, "Giant"],
    		[100, "Huge"],
    		[150, "Large"],
    		[200, "Medium"],
    		[300, "Small"],
    		[400, "Tiny"]
    	];

    	const gradients = ["luster", "spotlight", "backlight"];
    	const diapers = ["nourse", "tessellation"];
    	const tinctures = ["argent", "or", "gules", "sable", "azure", "vert", "purpure"];

    	const defaultColors = {
    		argent: "#fafafa",
    		or: "#ffe066",
    		gules: "#d7374a",
    		sable: "#333333",
    		azure: "#377cd7",
    		vert: "#26c061",
    		purpure: "#522d5b"
    	};

    	// don't lock options on load
    	const loaded = [];

    	function lock(key, value) {
    		if (loaded.includes(key)) localStorage.setItem(key, value); else loaded.push(key);
    	}

    	function getRandomColor() {
    		const l = "0123456789ABCDEF";
    		set_store_value(background, $background = "#" + [0, 0, 0, 0, 0, 0].map(() => l[Math.floor(Math.random() * 16)]).join(""), $background);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => set_store_value(matrix, $matrix -= 1, $matrix);
    	const click_handler_1 = () => set_store_value(matrix, $matrix += 1, $matrix);
    	const click_handler_2 = () => download();
    	const click_handler_3 = s => set_store_value(size, $size = s[0], $size);
    	const click_handler_4 = t => set_store_value(colors, $colors[t] = defaultColors[t], $colors);

    	function input_input_handler(t) {
    		$colors[t] = this.value;
    		colors.set($colors);
    		$$invalidate(18, tinctures);
    	}

    	const click_handler_5 = sh => set_store_value(shield, $shield = sh, $shield);
    	const click_handler_6 = () => set_store_value(grad, $grad = null, $grad);
    	const click_handler_7 = g => set_store_value(grad, $grad = g, $grad);
    	const click_handler_8 = () => set_store_value(diaper, $diaper = null, $diaper);
    	const click_handler_9 = d => set_store_value(diaper, $diaper = d, $diaper);
    	const click_handler_10 = () => set_store_value(border, $border = "#333333", $border);

    	function input0_input_handler() {
    		$border = this.value;
    		border.set($border);
    	}

    	function input1_input_handler() {
    		$borderWidth = to_number(this.value);
    		borderWidth.set($borderWidth);
    	}

    	function input2_change_input_handler() {
    		$grid = to_number(this.value);
    		grid.set($grid);
    	}

    	function input3_input_handler() {
    		$grid = to_number(this.value);
    		grid.set($grid);
    	}

    	const click_handler_11 = () => set_store_value(background, $background = "#333333", $background);

    	function input4_input_handler() {
    		$background = this.value;
    		background.set($background);
    	}

    	function input5_change_input_handler() {
    		$scale = to_number(this.value);
    		scale.set($scale);
    	}

    	function input6_input_handler() {
    		$scale = to_number(this.value);
    		scale.set($scale);
    	}

    	const click_handler_12 = () => changes.undo();
    	const click_handler_13 = () => changes.redo();
    	const click_handler_14 = () => set_store_value(state, $state.edit = 0, $state);
    	const click_handler_15 = () => set_store_value(state, $state.about = 1, $state);

    	$$self.$capture_state = () => ({
    		Tooltip,
    		Lock,
    		fade,
    		download,
    		size,
    		grad,
    		diaper,
    		shield,
    		colors,
    		background,
    		scale,
    		border,
    		borderWidth,
    		grid,
    		matrix,
    		state,
    		changes,
    		shields,
    		paths,
    		sizes,
    		gradients,
    		diapers,
    		tinctures,
    		defaultColors,
    		loaded,
    		lock,
    		getRandomColor,
    		position,
    		$changes,
    		$size,
    		$grad,
    		$diaper,
    		$shield,
    		$colors,
    		$background,
    		$scale,
    		$border,
    		$borderWidth,
    		$grid,
    		$matrix,
    		$state
    	});

    	$$self.$inject_state = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    	};

    	let position;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[1] & /*$changes*/ 16384) {
    			 $$invalidate(0, position = $changes[1]);
    		}

    		if ($$self.$$.dirty[0] & /*$size*/ 2) {
    			// save options on change
    			 lock("size", $size);
    		}

    		if ($$self.$$.dirty[0] & /*$grad*/ 4) {
    			 lock("grad", $grad);
    		}

    		if ($$self.$$.dirty[0] & /*$diaper*/ 8) {
    			 lock("diaper", $diaper);
    		}

    		if ($$self.$$.dirty[0] & /*$shield*/ 16) {
    			 lock("shield", $shield);
    		}

    		if ($$self.$$.dirty[0] & /*$colors*/ 32) {
    			 lock("colors", JSON.stringify($colors));
    		}

    		if ($$self.$$.dirty[0] & /*$background*/ 64) {
    			 lock("background", $background);
    		}

    		if ($$self.$$.dirty[0] & /*$scale*/ 128) {
    			 lock("scale", $scale);
    		}

    		if ($$self.$$.dirty[0] & /*$border*/ 256) {
    			 lock("border", $border);
    		}

    		if ($$self.$$.dirty[0] & /*$borderWidth*/ 512) {
    			 lock("borderWidth", $borderWidth);
    		}

    		if ($$self.$$.dirty[0] & /*$grid*/ 1024) {
    			 lock("grid", $grid);
    		}
    	};

    	return [
    		position,
    		$size,
    		$grad,
    		$diaper,
    		$shield,
    		$colors,
    		$background,
    		$scale,
    		$border,
    		$borderWidth,
    		$grid,
    		$matrix,
    		$state,
    		shields,
    		paths,
    		sizes,
    		gradients,
    		diapers,
    		tinctures,
    		defaultColors,
    		getRandomColor,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		input_input_handler,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10,
    		input0_input_handler,
    		input1_input_handler,
    		input2_change_input_handler,
    		input3_input_handler,
    		click_handler_11,
    		input4_input_handler,
    		input5_change_input_handler,
    		input6_input_handler,
    		click_handler_12,
    		click_handler_13,
    		click_handler_14,
    		click_handler_15
    	];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\About.svelte generated by Svelte v3.29.4 */
    const file$3 = "src\\About.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let span2;
    	let t5;
    	let span3;
    	let t7;
    	let span4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "×";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "About";
    			t3 = space();
    			span2 = element("span");
    			span2.textContent = "Services";
    			t5 = space();
    			span3 = element("span");
    			span3.textContent = "Clients";
    			t7 = space();
    			span4 = element("span");
    			span4.textContent = "Contact";
    			attr_dev(span0, "class", "close svelte-blboll");
    			add_location(span0, file$3, 6, 4, 115);
    			attr_dev(span1, "class", "svelte-blboll");
    			add_location(span1, file$3, 7, 4, 189);
    			attr_dev(span2, "class", "svelte-blboll");
    			add_location(span2, file$3, 8, 4, 213);
    			attr_dev(span3, "class", "svelte-blboll");
    			add_location(span3, file$3, 9, 4, 240);
    			attr_dev(span4, "class", "svelte-blboll");
    			add_location(span4, file$3, 10, 4, 266);
    			attr_dev(div0, "class", "overlay-content svelte-blboll");
    			add_location(div0, file$3, 5, 4, 80);
    			attr_dev(div1, "id", "about");
    			attr_dev(div1, "class", "svelte-blboll");
    			add_location(div1, file$3, 4, 0, 58);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t1);
    			append_dev(div0, span1);
    			append_dev(div0, t3);
    			append_dev(div0, span2);
    			append_dev(div0, t5);
    			append_dev(div0, span3);
    			append_dev(div0, t7);
    			append_dev(div0, span4);

    			if (!mounted) {
    				dispose = listen_dev(span0, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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
    	let $state;
    	validate_store(state, "state");
    	component_subscribe($$self, state, $$value => $$invalidate(0, $state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => set_store_value(state, $state.about = 0, $state);
    	$$self.$capture_state = () => ({ state, $state });
    	return [$state, click_handler];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Ordinary.svelte generated by Svelte v3.29.4 */
    const file$4 = "src\\Ordinary.svelte";

    // (52:0) {:else}
    function create_else_block$2(ctx) {
    	let g;
    	let raw_value = getTemplate(/*ordinary*/ ctx[0].ordinary, /*ordinary*/ ctx[0].line) + "";
    	let g_transform_value;
    	let g_fill_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			attr_dev(g, "class", "ordinary svelte-16j86ru");
    			attr_dev(g, "transform", g_transform_value = transformOrdinary(/*ordinary*/ ctx[0]));
    			attr_dev(g, "transform-origin", "center");
    			attr_dev(g, "fill", g_fill_value = /*colors*/ ctx[2][/*t*/ ctx[3]]);
    			toggle_class(g, "editable", /*$state*/ ctx[4].editn);
    			add_location(g, file$4, 52, 2, 1963);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			g.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = listen_dev(g, "click", /*addDrag*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ordinary*/ 1 && raw_value !== (raw_value = getTemplate(/*ordinary*/ ctx[0].ordinary, /*ordinary*/ ctx[0].line) + "")) g.innerHTML = raw_value;
    			if (dirty & /*ordinary*/ 1 && g_transform_value !== (g_transform_value = transformOrdinary(/*ordinary*/ ctx[0]))) {
    				attr_dev(g, "transform", g_transform_value);
    			}

    			if (dirty & /*colors, t*/ 12 && g_fill_value !== (g_fill_value = /*colors*/ ctx[2][/*t*/ ctx[3]])) {
    				attr_dev(g, "fill", g_fill_value);
    			}

    			if (dirty & /*$state*/ 16) {
    				toggle_class(g, "editable", /*$state*/ ctx[4].editn);
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
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(52:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (48:39) 
    function create_if_block_1$1(ctx) {
    	let g;
    	let path;
    	let path_stroke_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", /*shieldPath*/ ctx[1]);
    			attr_dev(path, "fill", "none");
    			attr_dev(path, "stroke", path_stroke_value = /*colors*/ ctx[2][/*t*/ ctx[3]]);
    			attr_dev(path, "stroke-width", "5%");
    			attr_dev(path, "transform", "scale(.85)");
    			attr_dev(path, "transform-origin", "center");
    			add_location(path, file$4, 49, 4, 1822);
    			attr_dev(g, "class", "ordinary svelte-16j86ru");
    			toggle_class(g, "editable", /*$state*/ ctx[4].edit);
    			add_location(g, file$4, 48, 2, 1748);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, path);

    			if (!mounted) {
    				dispose = listen_dev(g, "click", /*addDrag*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*shieldPath*/ 2) {
    				attr_dev(path, "d", /*shieldPath*/ ctx[1]);
    			}

    			if (dirty & /*colors, t*/ 12 && path_stroke_value !== (path_stroke_value = /*colors*/ ctx[2][/*t*/ ctx[3]])) {
    				attr_dev(path, "stroke", path_stroke_value);
    			}

    			if (dirty & /*$state*/ 16) {
    				toggle_class(g, "editable", /*$state*/ ctx[4].edit);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(48:39) ",
    		ctx
    	});

    	return block;
    }

    // (44:0) {#if ordinary.ordinary === "bordure"}
    function create_if_block$3(ctx) {
    	let g;
    	let path;
    	let path_stroke_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", /*shieldPath*/ ctx[1]);
    			attr_dev(path, "fill", "none");
    			attr_dev(path, "stroke", path_stroke_value = /*colors*/ ctx[2][/*t*/ ctx[3]]);
    			attr_dev(path, "stroke-width", "16.7%");
    			add_location(path, file$4, 45, 4, 1621);
    			attr_dev(g, "class", "ordinary svelte-16j86ru");
    			toggle_class(g, "editable", /*$state*/ ctx[4].edit);
    			add_location(g, file$4, 44, 2, 1547);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, path);

    			if (!mounted) {
    				dispose = listen_dev(g, "click", /*addDrag*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*shieldPath*/ 2) {
    				attr_dev(path, "d", /*shieldPath*/ ctx[1]);
    			}

    			if (dirty & /*colors, t*/ 12 && path_stroke_value !== (path_stroke_value = /*colors*/ ctx[2][/*t*/ ctx[3]])) {
    				attr_dev(path, "stroke", path_stroke_value);
    			}

    			if (dirty & /*$state*/ 16) {
    				toggle_class(g, "editable", /*$state*/ ctx[4].edit);
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(44:0) {#if ordinary.ordinary === \\\"bordure\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*ordinary*/ ctx[0].ordinary === "bordure") return create_if_block$3;
    		if (/*ordinary*/ ctx[0].ordinary === "orle") return create_if_block_1$1;
    		return create_else_block$2;
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function transformOrdinary(o) {
    	if (!o.x && !o.y && !o.size) return null;
    	return `translate(${o.x || 0}, ${o.y || 0}) scale(${o.size || 1})`;
    }

    function getTemplate(templateId, lineId) {
    	if (!lineId) return document.getElementById(templateId)?.innerHTML;
    	const template = document.getElementById(templateId);

    	const line = document.getElementById(lineId)
    	? document.getElementById(lineId)
    	: document.getElementById("straight");

    	return template.innerHTML.replace(/{line}/g, line.getAttribute("d")).replace(/dpath/g, "d");
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $state;
    	validate_store(state, "state");
    	component_subscribe($$self, state, $$value => $$invalidate(4, $state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Ordinary", slots, []);

    	let { ordinary } = $$props,
    		{ shieldPath } = $$props,
    		{ colors } = $$props,
    		{ t } = $$props;

    	function addDrag() {
    		if (!$state.edit) return;
    		let dragStartX, dragStartY, objInitLeft, objInitTop;
    		let inDrag = false;
    		let dragTarget = this;
    		const grid = 10;

    		dragTarget.addEventListener("mousedown", function (e) {
    			inDrag = true;
    			objInitLeft = dragTarget.offsetLeft || 0;
    			objInitTop = dragTarget.offsetTop || 0;
    			dragStartX = e.pageX;
    			dragStartY = e.pageY;
    		});

    		document.addEventListener("mousemove", function (e) {
    			if (!inDrag) {
    				return;
    			}

    			const x = Math.round((objInitLeft + e.pageX - dragStartX) / grid) * grid;
    			const y = Math.round((objInitTop + e.pageY - dragStartY) / grid) * grid;
    			dragTarget.setAttribute("transform", `translate(${x},${y})`);
    		});

    		document.addEventListener("mouseup", () => inDrag = false);
    	}

    	const writable_props = ["ordinary", "shieldPath", "colors", "t"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Ordinary> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("ordinary" in $$props) $$invalidate(0, ordinary = $$props.ordinary);
    		if ("shieldPath" in $$props) $$invalidate(1, shieldPath = $$props.shieldPath);
    		if ("colors" in $$props) $$invalidate(2, colors = $$props.colors);
    		if ("t" in $$props) $$invalidate(3, t = $$props.t);
    	};

    	$$self.$capture_state = () => ({
    		state,
    		ordinary,
    		shieldPath,
    		colors,
    		t,
    		transformOrdinary,
    		getTemplate,
    		addDrag,
    		$state
    	});

    	$$self.$inject_state = $$props => {
    		if ("ordinary" in $$props) $$invalidate(0, ordinary = $$props.ordinary);
    		if ("shieldPath" in $$props) $$invalidate(1, shieldPath = $$props.shieldPath);
    		if ("colors" in $$props) $$invalidate(2, colors = $$props.colors);
    		if ("t" in $$props) $$invalidate(3, t = $$props.t);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ordinary, shieldPath, colors, t, $state, addDrag];
    }

    class Ordinary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			ordinary: 0,
    			shieldPath: 1,
    			colors: 2,
    			t: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ordinary",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*ordinary*/ ctx[0] === undefined && !("ordinary" in props)) {
    			console.warn("<Ordinary> was created without expected prop 'ordinary'");
    		}

    		if (/*shieldPath*/ ctx[1] === undefined && !("shieldPath" in props)) {
    			console.warn("<Ordinary> was created without expected prop 'shieldPath'");
    		}

    		if (/*colors*/ ctx[2] === undefined && !("colors" in props)) {
    			console.warn("<Ordinary> was created without expected prop 'colors'");
    		}

    		if (/*t*/ ctx[3] === undefined && !("t" in props)) {
    			console.warn("<Ordinary> was created without expected prop 't'");
    		}
    	}

    	get ordinary() {
    		throw new Error("<Ordinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ordinary(value) {
    		throw new Error("<Ordinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shieldPath() {
    		throw new Error("<Ordinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shieldPath(value) {
    		throw new Error("<Ordinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colors() {
    		throw new Error("<Ordinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Ordinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t() {
    		throw new Error("<Ordinary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t(value) {
    		throw new Error("<Ordinary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const tinctures = {
      field: {metals:5, colours:7, patterns:2},
      division: {metals:5, colours:7, patterns:1},
      charge: {metals:2, colours:3},
      metals: {
        field: {argent:3, or:2},
        division: {argent:3, or:2},
        charge: {argent:1, or:2}
      },
      colours: {
        field: {gules:5, sable:3, azure:4, vert:2, purpure:3},
        division: {gules:5, sable:3, azure:4, vert:2, purpure:3},
        charge: {gules:7, sable:1, azure:5, vert:3, purpure:2}
      },
      patterns: { // patterns including furs
        field: {semy:1, vair:2, vairInPale:1, vairEnPointe:2, ermine:2, chequy:4, lozengy:2, fusily:1, pally: 4, barry: 4, gemelles:1, bendy:3, bendySinister:2, palyBendy:1, pappellony:2, masoned:3, fretty:2},
        division: {semy:1, vair:3, vairInPale:2, vairEnPointe:3, ermine:4, chequy:3, lozengy:1, fusily:1, pally: 5, barry: 5, bendy:2, bendySinister:1, pappellony:1, masoned:3, fretty:1}
      }
    };

    const positionsArray = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "kn", "df", "pq", "beh", "jei", "abc", "jln", "jlh", "def", "joe", "pqe", "lme", "bhdf", "jleh", "behdf", "acegi", "bdefh", "eknpq", "abcpqh", "abcdefgzi", "ABCDEFGHIJK"];

    const positions = {
      conventional: {e:20, abcdefgzi:3, beh:3, behdf:2, acegi:1, kn:3, bhdf:1, jei:1, abc:3, jln:8, jlh:4, jleh:1, def:3, abcpqh:4, ABCDEFGHIJK:1},
      complex: {e:40, beh:1, kn:1, jei:1, abc:2, jln:8, jlh:2, def:1, abcpqh:1},
      divisions: {
        perPale: {e:15, pq:5, jo:2, jl:2, ABCDEFGHIJK:1},
        perFess: {e:12, kn:4, jkl:2, gizgiz:1, jlh:3, kmo:1, ABCDEFGHIJK:1},
        perBend: {e:5, lm:5, bcfdgh:1},
        perBendSinister: {e:1, jo:1},
        perCross: {e:4, jlmo:1, jj:1, jo:2, jl:1},
        perChevron: {e:1, jlh:1, dfk:1, dfkh:2, bdefh:1},
        perChevronReversed: {e:1, mok:2, dfh:2, dfkh:1, bdefh:1},
        perSaltire: {bhdf:8, e:3, abcdefgzi:1, bh:1, df:1, beh:1, behdf:1, ABCDEFGHIJK:1},
        perPile: {ee:3, be:2, abceh:1, abcabc:1, jleh:1}
      },
      ordinariesOn: {
        pale: {ee:12, beh:10, kn:3, bb:1},
        fess: {ee:1, def:3},
        bar: {defdefdef:1},
        fessCotissed: {ee:1, def:3},
        fessDoubleCotissed: {ee:1, defdef:3},
        bend: {ee:2, jo:1, joe:1},
        bendSinister: {ee:1, lm:1, lem:4},
        bendlet: {joejoejoe:1},
        bendletSinister: {lemlemlem:1},
        bordure: {ABCDEFGHIJK:1},
        chief: {abc:5, bb:1},
        quarter: {jjj:1},
        canton: {yyyy:1},
        cross: {eeee:1, behdfbehdf:3, behbehbeh:2},
        crossParted: {e:5, ee:1},
        saltire: {ee:5, jlemo:1},
        saltireParted: {e:5, ee:1},
        pall: {ee:1, acez:5, jlhh:3},
        pallReversed: {ee:1, bemo:5},
        pile: {bb:1},
        pileInBend: {eeee:1, eeoo:1},
        pileInBendSinister: {eeee:1, eemm:1}
      },
      ordinariesOff: {
        pale: {yy:1},
        fess: {abc:3, abcz:1},
        bar: {abc:2, abcgzi:1, jlh:5, bgi:2, ach:1},
        gemelle: {abc:1},
        bend: {cg:2, cc:1},
        bendSinister: {ai:2, aa:1},
        bendlet: {cg:2, cc:1},
        bendletSinister: {ai:2, aa:1},
        bordure: {e:3, kerker:1, peqpeq:1},
        orle: {e:3, kerker:1, peqpeq:1},
        chief: {emo:2, emoz:1, ez:2},
        terrace: {e:5, def:1, bdf:3},
        mount: {e:5, def:1, bdf:3},
        point: {e:2, def:1, bdf:3, acbdef:1},
        flaunches: {e:3, kn:1, beh:3},
        qyron: {bh:1},
        quarter: {e:1},
        canton: {e:5, beh:1, def:1, bdefh:1, kn:1},
        cross: {acgi:1},
        pall: {BCKFEILGbdmfo:1},
        pallReversed: {aczac:1},
        chevron: {ach:3, hh:1},
        chevronReversed: {bb:1},
        pile: {acdfgi:1, acac:1},
        pileInBend: {cg:1},
        pileInBendSinister: {ai:1},
        label: {defgzi:2, eh:3, defdefhmo:1, egiegi:1, pqn:5}
      },
      // charges
      inescutcheonHeater: {e:3, jln:1},
      inescutcheonOldFrench: {e:3, jln:1},
      inescutcheonSpanish: {e:3, jln:1},
      mascle: {e:15, abcdefgzi:3, beh:3, bdefh:4, acegi:1, kn:3, joe:2, abc:3, jlh:8, jleh:1, df:3, abcpqh:4, pqe:3, eknpq:3},
      lionRampant: {e:10, def:2, abc:2, bdefh:1, kn:1, jlh:2, abcpqh:1},
      lionPassant:{e:10, def:1, abc:1, bdefh:1, jlh:1, abcpqh:1},
      wolfPassant:{e:10, def:1, abc:1, bdefh:1, jlh:1, abcpqh:1},
      greyhoundСourant:{e:10, def:1, abc:1, bdefh:1, jlh:1, abcpqh:1},
      griffinRampant: {e:10, def:2, abc:2, bdefh:1, kn:1, jlh:2, abcpqh:1},
      griffinPassant:{e:10, def:1, abc:1, bdefh:1, jlh:1, abcpqh:1},
      boarRampant:{e:12, beh:1, kn:1, jln:2},
      eagle:{e:15, beh:1, kn:1, abc:1, jlh:2, def:2, pq:1},
      raven:{e:15, beh:1, kn:1, jei:1, abc:3, jln:3, def:1},
      wyvern:{e:10, jln:1},
      garb: {e:1, def:3, abc:2, beh:1, kn:1, jln:3, jleh:1, abcpqh:1, joe:1, lme:1},
      crown: {e:10, abcdefgzi:1, beh:3, behdf:2, acegi:1, kn:1, pq:2, abc:1, jln:4, jleh:1, def:2, abcpqh:3},
      hand:{e:10, jln:2, kn:1, jei:1, abc:2, pqe:1}
    };

    const lines = {straight:40, wavy:8, engrailed:4, invecked:3, rayonne:3, embattled:1, raguly:1, urdy:1, dancetty:1, indented:2,
      dentilly:1, bevilled:1, angled:1, flechy:1, barby:1, enclavy:1, escartely:1, arched:2, archedReversed:1, nowy:1, nowyReversed:1,
      embattledGhibellin:1, embattledNotched:1, embattledGrady:1, dovetailedIntented:1, dovetailed:1,
      potenty:1, potentyDexter:1, potentySinister:1, nebuly:2, seaWaves:1, dragonTeeth:1, firTrees:1};

    const divisions = {
      variants: {perPale:5, perFess:5, perBend:2, perBendSinister:1, perChevron:1, perChevronReversed:1, perCross:5, perPile:1, perSaltire:1, gyronny:1, chevronny:1},
      perPale: lines,
      perFess: lines,
      perBend: lines,
      perBendSinister: lines,
      perChevron: lines,
      perChevronReversed: lines,
      perCross: {straight:20, wavy:5, engrailed:4, invecked:3, rayonne:1, embattled:1, raguly:1, urdy:1, indented:2, dentilly:1, bevilled:1, angled:1, embattledGhibellin:1, embattledGrady:1, dovetailedIntented:1, dovetailed:1, potenty:1, potentyDexter:1, potentySinister:1, nebuly:1},
      perPile: lines
    };

    const ordinaries = {
      lined: {pale:7, fess:5, bend:3, bendSinister:2, chief:5, bar:2, gemelle:1, fessCotissed:1, fessDoubleCotissed:1,
        bendlet:2, bendletSinister:1, terrace:3, cross:6, crossParted:1, saltire:2, saltireParted:1},
      straight: {bordure:7, orle:3, mount:1, point:2, flaunches:1, gore:1,
        qyron:1, quarter:1, canton:2, pall:3, pallReversed:2, chevron:4, chevronReversed:3,
        pile:2, pileInBend:2, pileInBendSinister:1, piles:1, pilesInPoint:2, label:1}
    };

    const charges = {
      types: {conventional:30, crosses:8, animals:3, birds:2, aquatic:1, fantastic:3, plants:1, agriculture:1, arms:1, bodyparts:1, miscellaneous:3, inescutcheon:3},
      single: {conventional:12, crosses:8, plants:2, animals:11, birds:4, aquatic:2, fantastic:7, agriculture:1, arms:5, bodyparts:1, miscellaneous:8, inescutcheon:5},
      semy: {conventional:12, crosses:3, plants:1},
      conventional: {lozenge:2, fusil:4, mascle:4, rustre:2, lozengeFaceted:3, lozengePloye:1, roundel:7, annulet:4,
        mullet:5, mulletPierced:1, mulletFaceted:1, mullet4:3, mullet6:4, mullet6Pierced:1, mullet6Faceted:1, mullet7:1, mullet8:1, mullet10:1,
        estoile:1, billet:5, triangle:3, trianglePierced:1, goutte:4, heart:4, pique:2, trefle:2, сarreau:1,
        fleurDeLis:6, sun:3, sunInSplendour:1, crescent:5, fountain:1, compassRose:1, fountain:1},
      inescutcheon: {inescutcheonHeater:2, inescutcheonOldFrench:1, inescutcheonSpanish:4},
      crosses: {crossHummetty:15, crossVoided:1, crossPattee:3, crossPotent:2, crossClechy:3, crosslet:1, crossBottony:1, crossFleury:3,
        crossPatonce:1, crossPommy:1, crossGamma:1, crossArrowed:1, crossFitchy:1, crossCercelee:1, crossMoline:2, crossFourchy:1,
        crossAvellane:1, crossErminee:1, crossMaltese:3, crossCeltic:1, crossOccitan:1, crossSaltire:3, crossTau:1},
      animals:{lionRampant:4, lionPassant:1, wolfPassant:1, greyhoundСourant:1, boarRampant:1, horseRampant:1, horseSalient:1, bullPassant:1, bullHeadCaboshed:1, deerHeadCaboshed:1},
      fantastic:{dragonPassant:3, wyvern:2, griffinPassant:1, griffinRampant:1, eagleTwoHeards:2, unicornRampant:1, pegasus:1, serpent:1},
      birds:{eagle:9, raven:2, cock:3, parrot:1, swan:2, swanErased:1, heron:1},
      plants:{cinquefoil:1, rose:1},
      aquatic:{escallop:5, pike:1, cancer:1},
      agriculture: {garb:1},
      arms:{sword:5, hatchet:2, lochaberAxe:1, mallet:1},
      bodyparts:{hand:1},
      miscellaneous:{crown:3, key:1, buckle:1, bugleHorn:1, horseshoe:3, stagsAttires:1, cowHorns:2, wing:1, wingSword:1, lute:1, harp:1, wheel:2, boat:1},
      natural: {fountain:"azure", garb:"or", raven:"sable"}, // charges to use predefined colours
      sinister: ["crossGamma", "lionRampant", "lionPassant", "wolfPassant", "greyhoundСourant", "boarRampant", "horseRampant", "horseSalient", "bullPassant",
        "eagle", "raven", "cock", "parrot", "swan", "swanErased", "heron", "pike", "dragonPassant", "wyvern", "griffinPassant", "griffinRampant", "unicornRampant",
        "pegasus", "serpent", "hatchet", "lochaberAxe", "hand", "wing", "wingSword", "lute", "harp"], // charges that can be sinister
      reversed: ["goutte", "mullet", "mullet7", "crescent", "crossTau", "cancer", "sword", "hand", "horseshoe"] // charges that can be reversed
    };

    const shields = {
      // shieldSpecific position: [x, y] (relative to center)
      heater:     {a:[-43.75, -50], b:[0, -50], c:[43.75, -50],
                  d:[-43.75, 0], e:[0, 0], f:[43.75, 0],
                  g:[-32.25, 37.5], h:[0, 50], i:[32.25, 37.5],
                  y:[-50, -50], z:[0, 62.5],
                  j:[-37.5, -37.5], k:[0, -37.5], l:[37.5, -37.5],
                  m:[-32.5, 32.5], n:[0, 42.5], o:[32.5, 32.5],
                  p:[-37.5, 0], q:[37.5, 0], r:[0, 37.5],
                  A:[-66.2, -66.6], B:[-22, -66.6], C:[22, -66.6], D:[66.2, -66.6],
                  E:[66.2, -20], F:[55.5, 26], G:[33, 62], H:[0, 89.5],
                  I:[-33, 62], J:[-55.5, 26], K:[-66.2, -20]},
      oldFrench:  {a:[-43.75, -50], b:[0, -50], c:[43.75, -50],
                  d:[-43.75, 0], e:[0, 0], f:[43.75, 0],
                  g:[-37.5, 50], h:[0, 50], i:[37.5, 50],
                  y:[-50, -50], z:[0, 62.5],
                  j:[-37.5, -37.5], k:[0, -37.5], l:[37.5, -37.5],
                  m:[-37.5, 37.5], n:[0, 45], o:[37.5, 37.5],
                  p:[-37.5, 0], q:[37.5, 0], r:[0, 37.5],
                  A:[-66.2, -66.6], B:[-22, -66.6], C:[22, -66.6], D:[66.2, -66.6],
                  E:[66.2, -20], F:[64, 26], G:[45, 62], H:[0, 91.5],
                  I:[-45, 62], J:[-64, 26], K:[-66.2, -20]},
      spanish:    {a:[-43.75, -50], b:[0, -50], c:[43.75, -50],
                  d:[-43.75, 0], e:[0, 0], f:[43.75, 0],
                  g:[-43.75, 50], h:[0, 50], i:[43.75, 50],
                  y:[-50, -50], z:[0, 50],
                  j:[-37.5, -37.5], k:[0, -37.5], l:[37.5, -37.5],
                  m:[-37.5, 37.5], n:[0, 50], o:[37.5, 37.5],
                  p:[-37.5, 0], q:[37.5, 0], r:[0, 37.5],
                  A:[-66.2, -66.6], B:[-22, -66.6], C:[22, -66.6], D:[66.2, -66.6],
                  E:[66.4, -20], F:[66.4, 26], G:[49, 70], H:[0, 92],
                  I:[-49, 70], J:[-66.4, 26], K:[-66.4, -20]},
      wedged:     {a:[-43.75, -50], b:[0, -50], c:[43.75, -50], // copy of heater, need to change
                  d:[-43.75, 0], e:[0, 0], f:[43.75, 0],
                  g:[-32.25, 37.5], h:[0, 50], i:[32.25, 37.5],
                  y:[-50, -50], z:[0, 62.5],
                  j:[-37.5, -37.5], k:[0, -37.5], l:[37.5, -37.5],
                  m:[-32.5, 32.5], n:[0, 42.5], o:[32.5, 32.5],
                  p:[-37.5, 0], q:[37.5, 0], r:[0, 37.5],
                  A:[-66.2, -66.6], B:[-22, -66.6], C:[22, -66.6], D:[66.2, -66.6],
                  E:[66.2, -20], F:[55.5, 26], G:[33, 62], H:[0, 89.5],
                  I:[-33, 62], J:[-55.5, 26], K:[-66.2, -20]}
    };

    /* src\Charge.svelte generated by Svelte v3.29.4 */
    const file$5 = "src\\Charge.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (67:2) {#each positions as p}
    function create_each_block$1(ctx) {
    	let use;
    	let use_href_value;
    	let use_transform_value;
    	let use_fill_value;

    	const block = {
    		c: function create() {
    			use = svg_element("use");
    			attr_dev(use, "href", use_href_value = "#" + /*charge*/ ctx[0].charge);
    			attr_dev(use, "transform", use_transform_value = /*getElTransform*/ ctx[8](/*shieldPositions*/ ctx[4], /*charge*/ ctx[0], /*p*/ ctx[16]));
    			attr_dev(use, "transform-origin", "center");
    			attr_dev(use, "fill", use_fill_value = /*colors*/ ctx[2][/*t*/ ctx[3]]);
    			add_location(use, file$5, 67, 4, 2589);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, use, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*charge*/ 1 && use_href_value !== (use_href_value = "#" + /*charge*/ ctx[0].charge)) {
    				attr_dev(use, "href", use_href_value);
    			}

    			if (dirty & /*shieldPositions, charge, positions*/ 49 && use_transform_value !== (use_transform_value = /*getElTransform*/ ctx[8](/*shieldPositions*/ ctx[4], /*charge*/ ctx[0], /*p*/ ctx[16]))) {
    				attr_dev(use, "transform", use_transform_value);
    			}

    			if (dirty & /*colors, t*/ 12 && use_fill_value !== (use_fill_value = /*colors*/ ctx[2][/*t*/ ctx[3]])) {
    				attr_dev(use, "fill", use_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(use);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(67:2) {#each positions as p}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let g;
    	let g_charge_value;
    	let g_transform_value;
    	let mounted;
    	let dispose;
    	let each_value = /*positions*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "charge svelte-172iswd");
    			attr_dev(g, "i", /*i*/ ctx[1]);
    			attr_dev(g, "charge", g_charge_value = /*getCharge*/ ctx[7](/*charge*/ ctx[0].charge));
    			attr_dev(g, "transform", g_transform_value = getChargeTransform(/*charge*/ ctx[0]));
    			attr_dev(g, "transform-origin", "center");
    			attr_dev(g, "stroke", "#000");
    			toggle_class(g, "editable", /*$state*/ ctx[6].edit);
    			add_location(g, file$5, 65, 0, 2345);
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
    				dispose = listen_dev(g, "mousedown", /*mousedown_handler*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*charge, getElTransform, shieldPositions, positions, colors, t*/ 317) {
    				each_value = /*positions*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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

    			if (dirty & /*charge*/ 1 && g_charge_value !== (g_charge_value = /*getCharge*/ ctx[7](/*charge*/ ctx[0].charge))) {
    				attr_dev(g, "charge", g_charge_value);
    			}

    			if (dirty & /*charge*/ 1 && g_transform_value !== (g_transform_value = getChargeTransform(/*charge*/ ctx[0]))) {
    				attr_dev(g, "transform", g_transform_value);
    			}

    			if (dirty & /*$state*/ 64) {
    				toggle_class(g, "editable", /*$state*/ ctx[6].edit);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getChargeTransform(c) {
    	if (!c.x && !c.y && !c.angle) return null;
    	return `rotate(${c.angle || 0}) translate(${c.x || 0} ${c.y || 0})`;
    }

    function parseTransform(string) {
    	if (!string) {
    		return [0, 0, 0, 0, 0, 1];
    	}

    	const a = string.replace(/[a-z()]/g, "").replace(/[ ]/g, ",").split(",");
    	return [+a[0] || 0, +a[1] || 0, +a[2] || 0, +a[3] || 0, +a[4] || 0, +a[5] || 1];
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $loadedCharges;
    	let $state;
    	let $grid;
    	validate_store(loadedCharges, "loadedCharges");
    	component_subscribe($$self, loadedCharges, $$value => $$invalidate(13, $loadedCharges = $$value));
    	validate_store(state, "state");
    	component_subscribe($$self, state, $$value => $$invalidate(6, $state = $$value));
    	validate_store(grid, "grid");
    	component_subscribe($$self, grid, $$value => $$invalidate(14, $grid = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Charge", slots, []);

    	let { coa } = $$props,
    		{ charge } = $$props,
    		{ i } = $$props,
    		{ shield } = $$props,
    		{ colors } = $$props,
    		{ t } = $$props;

    	const defs = document.getElementById("charges");

    	function getCharge(charge) {
    		if ($loadedCharges[charge] || defs.querySelector("#" + charge)) return charge;
    		set_store_value(loadedCharges, $loadedCharges[charge] = 1, $loadedCharges);

    		fetch("charges/" + charge + ".svg").then(response => response.text()).then(text => {
    			const el = document.createElement("html");
    			el.innerHTML = text;
    			defs.insertAdjacentHTML("beforeend", el.querySelector("g").outerHTML);
    		});

    		return charge;
    	}

    	function getElTransform(shieldPositions, c, p) {
    		const [x, y] = shieldPositions[p];
    		const size = c.size || 1;

    		const scale = c.sinister || c.reversed
    		? `${c.sinister ? "-" : ""}${size}, ${c.reversed ? "-" : ""}${size}`
    		: size;

    		return `translate(${x} ${y}) scale(${scale})`;
    	}

    	function addDrag(e, c) {
    		if (!$state.edit) return;
    		const el = e.currentTarget;
    		const [a0, x0, y0] = parseTransform(el.getAttribute("transform"));
    		const x1 = e.pageX, y1 = e.pageY;
    		document.addEventListener("mousemove", drag);
    		document.addEventListener("mouseup", dragStop, { once: true });

    		function drag(e) {
    			document.body.style.cursor = "move";
    			c.x = Math.round((x0 + e.pageX - x1) / $grid) * $grid;
    			c.y = Math.round((y0 + e.pageY - y1) / $grid) * $grid;
    			const tr = getChargeTransform(c);
    			if (tr) el.setAttribute("transform", tr); else el.removeAttribute("transform");
    		}

    		function dragStop() {
    			document.removeEventListener("mousemove", drag);
    			document.body.style.cursor = "auto";
    			changes.add(JSON.stringify(coa));
    		}
    	}

    	const writable_props = ["coa", "charge", "i", "shield", "colors", "t"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Charge> was created with unknown prop '${key}'`);
    	});

    	const mousedown_handler = function (e) {
    		addDrag(e, charge);
    	};

    	$$self.$$set = $$props => {
    		if ("coa" in $$props) $$invalidate(10, coa = $$props.coa);
    		if ("charge" in $$props) $$invalidate(0, charge = $$props.charge);
    		if ("i" in $$props) $$invalidate(1, i = $$props.i);
    		if ("shield" in $$props) $$invalidate(11, shield = $$props.shield);
    		if ("colors" in $$props) $$invalidate(2, colors = $$props.colors);
    		if ("t" in $$props) $$invalidate(3, t = $$props.t);
    	};

    	$$self.$capture_state = () => ({
    		shields,
    		loadedCharges,
    		state,
    		changes,
    		grid,
    		coa,
    		charge,
    		i,
    		shield,
    		colors,
    		t,
    		defs,
    		getCharge,
    		getChargeTransform,
    		getElTransform,
    		addDrag,
    		parseTransform,
    		shieldPositions,
    		positions,
    		$loadedCharges,
    		$state,
    		$grid
    	});

    	$$self.$inject_state = $$props => {
    		if ("coa" in $$props) $$invalidate(10, coa = $$props.coa);
    		if ("charge" in $$props) $$invalidate(0, charge = $$props.charge);
    		if ("i" in $$props) $$invalidate(1, i = $$props.i);
    		if ("shield" in $$props) $$invalidate(11, shield = $$props.shield);
    		if ("colors" in $$props) $$invalidate(2, colors = $$props.colors);
    		if ("t" in $$props) $$invalidate(3, t = $$props.t);
    		if ("shieldPositions" in $$props) $$invalidate(4, shieldPositions = $$props.shieldPositions);
    		if ("positions" in $$props) $$invalidate(5, positions = $$props.positions);
    	};

    	let shieldPositions;
    	let positions;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*shield*/ 2048) {
    			 $$invalidate(4, shieldPositions = shields[shield] || shields.spanish);
    		}

    		if ($$self.$$.dirty & /*charge, shieldPositions*/ 17) {
    			 $$invalidate(5, positions = [...new Set(charge.p)].filter(p => shieldPositions[p]));
    		}
    	};

    	return [
    		charge,
    		i,
    		colors,
    		t,
    		shieldPositions,
    		positions,
    		$state,
    		getCharge,
    		getElTransform,
    		addDrag,
    		coa,
    		shield,
    		mousedown_handler
    	];
    }

    class Charge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			coa: 10,
    			charge: 0,
    			i: 1,
    			shield: 11,
    			colors: 2,
    			t: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Charge",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*coa*/ ctx[10] === undefined && !("coa" in props)) {
    			console.warn("<Charge> was created without expected prop 'coa'");
    		}

    		if (/*charge*/ ctx[0] === undefined && !("charge" in props)) {
    			console.warn("<Charge> was created without expected prop 'charge'");
    		}

    		if (/*i*/ ctx[1] === undefined && !("i" in props)) {
    			console.warn("<Charge> was created without expected prop 'i'");
    		}

    		if (/*shield*/ ctx[11] === undefined && !("shield" in props)) {
    			console.warn("<Charge> was created without expected prop 'shield'");
    		}

    		if (/*colors*/ ctx[2] === undefined && !("colors" in props)) {
    			console.warn("<Charge> was created without expected prop 'colors'");
    		}

    		if (/*t*/ ctx[3] === undefined && !("t" in props)) {
    			console.warn("<Charge> was created without expected prop 't'");
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

    	get colors() {
    		throw new Error("<Charge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Charge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t() {
    		throw new Error("<Charge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t(value) {
    		throw new Error("<Charge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Positions.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1 } = globals;
    const file$6 = "src\\Positions.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (16:0) {#if $state.positions}
    function create_if_block$4(ctx) {
    	let g;
    	let g_intro;
    	let each_value = /*points*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "id", "positions");
    			attr_dev(g, "transform", "translate(100, 100)");
    			add_location(g, file$6, 16, 2, 458);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*points, getClass, $state*/ 3) {
    				each_value = /*points*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (!g_intro) {
    				add_render_callback(() => {
    					g_intro = create_in_transition(g, fade, {});
    					g_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(16:0) {#if $state.positions}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#each points as p}
    function create_each_block$2(ctx) {
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
    			attr_dev(circle, "class", "svelte-157l0m0");
    			toggle_class(circle, "active", /*$state*/ ctx[1].positions.includes(/*p*/ ctx[3][0]));
    			add_location(circle, file$6, 19, 8, 593);
    			attr_dev(text_1, "x", text_1_x_value = /*p*/ ctx[3][1][0]);
    			attr_dev(text_1, "y", text_1_y_value = /*p*/ ctx[3][1][1]);
    			attr_dev(text_1, "class", "svelte-157l0m0");
    			toggle_class(text_1, "active", /*$state*/ ctx[1].positions.includes(/*p*/ ctx[3][0]));
    			add_location(text_1, file$6, 20, 8, 689);
    			attr_dev(g, "id", g_id_value = /*p*/ ctx[3][0]);
    			attr_dev(g, "class", g_class_value = "" + (null_to_empty(getClass(/*p*/ ctx[3][0])) + " svelte-157l0m0"));
    			add_location(g, file$6, 18, 6, 547);
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

    			if (dirty & /*points*/ 1 && g_class_value !== (g_class_value = "" + (null_to_empty(getClass(/*p*/ ctx[3][0])) + " svelte-157l0m0"))) {
    				attr_dev(g, "class", g_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(18:4) {#each points as p}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let if_block = /*$state*/ ctx[1].positions && create_if_block$4(ctx);

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
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function getClass(p) {
    	if (("abcdefghi").includes(p)) return "green";
    	if (("ABCDEFGHIJK").includes(p)) return "red";
    	return "blue";
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $shield;
    	let $state;
    	validate_store(shield, "shield");
    	component_subscribe($$self, shield, $$value => $$invalidate(2, $shield = $$value));
    	validate_store(state, "state");
    	component_subscribe($$self, state, $$value => $$invalidate(1, $state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Positions", slots, []);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Positions> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		state,
    		shield,
    		shields,
    		fade,
    		getClass,
    		points,
    		$shield,
    		$state
    	});

    	$$self.$inject_state = $$props => {
    		if ("points" in $$props) $$invalidate(0, points = $$props.points);
    	};

    	let points;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$shield*/ 4) {
    			// on shield change
    			 $$invalidate(0, points = shields[$shield]
    			? Object.entries(shields[$shield])
    			: Object.entries(shields.spanish));
    		}
    	};

    	return [points, $state];
    }

    class Positions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Positions",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\COA.svelte generated by Svelte v3.29.4 */

    const { console: console_1 } = globals;

    const file$7 = "src\\COA.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (46:4) {#if division}
    function create_if_block_17(ctx) {
    	let clipPath;
    	let raw_value = getTemplate$1(/*division*/ ctx[13].division, /*division*/ ctx[13].line) + "";
    	let clipPath_id_value;

    	const block = {
    		c: function create() {
    			clipPath = svg_element("clipPath");
    			attr_dev(clipPath, "id", clipPath_id_value = "divisionClip" + /*i*/ ctx[3]);
    			add_location(clipPath, file$7, 46, 6, 1753);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, clipPath, anchor);
    			clipPath.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*i*/ 8 && clipPath_id_value !== (clipPath_id_value = "divisionClip" + /*i*/ ctx[3])) {
    				attr_dev(clipPath, "id", clipPath_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(clipPath);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(46:4) {#if division}",
    		ctx
    	});

    	return block;
    }

    // (56:4) {#if division && ordinary?.divided}
    function create_if_block_14(ctx) {
    	let if_block0_anchor;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*ordinary*/ ctx[12].divided === "counter" && create_if_block_16(ctx);
    	let if_block1 = /*ordinary*/ ctx[12].divided === "field" && create_if_block_15(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, if_block0_anchor, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*ordinary*/ ctx[12].divided === "counter") if_block0.p(ctx, dirty);
    			if (/*ordinary*/ ctx[12].divided === "field") if_block1.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(if_block0_anchor);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(56:4) {#if division && ordinary?.divided}",
    		ctx
    	});

    	return block;
    }

    // (57:6) {#if ordinary.divided === "counter"}
    function create_if_block_16(ctx) {
    	let ordinary_1;
    	let current;

    	ordinary_1 = new Ordinary({
    			props: {
    				ordinary: /*ordinary*/ ctx[12],
    				shieldPath: /*shieldPath*/ ctx[5],
    				colors: /*coaColors*/ ctx[10],
    				t: /*tDiv*/ ctx[15]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_1_changes = {};
    			if (dirty & /*shieldPath*/ 32) ordinary_1_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty & /*coaColors*/ 1024) ordinary_1_changes.colors = /*coaColors*/ ctx[10];
    			ordinary_1.$set(ordinary_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(57:6) {#if ordinary.divided === \\\"counter\\\"}",
    		ctx
    	});

    	return block;
    }

    // (58:6) {#if ordinary.divided === "field"}
    function create_if_block_15(ctx) {
    	let ordinary_1;
    	let current;

    	ordinary_1 = new Ordinary({
    			props: {
    				ordinary: /*ordinary*/ ctx[12],
    				shieldPath: /*shieldPath*/ ctx[5],
    				colors: /*coaColors*/ ctx[10],
    				t: /*ordinary*/ ctx[12].t
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_1_changes = {};
    			if (dirty & /*shieldPath*/ 32) ordinary_1_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty & /*coaColors*/ 1024) ordinary_1_changes.colors = /*coaColors*/ ctx[10];
    			ordinary_1.$set(ordinary_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(58:6) {#if ordinary.divided === \\\"field\\\"}",
    		ctx
    	});

    	return block;
    }

    // (60:4) {#if diaperType === "field"}
    function create_if_block_13(ctx) {
    	let rect;
    	let rect_fill_value;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "class", "diaper svelte-1i16020");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "200");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", rect_fill_value = "url(#" + /*coaDiaper*/ ctx[6] + ")");
    			add_location(rect, file$7, 59, 32, 2374);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*coaDiaper*/ 64 && rect_fill_value !== (rect_fill_value = "url(#" + /*coaDiaper*/ ctx[6] + ")")) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(60:4) {#if diaperType === \\\"field\\\"}",
    		ctx
    	});

    	return block;
    }

    // (64:55) 
    function create_if_block_12(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[25],
    				i: /*i*/ ctx[3],
    				shield: /*coaShield*/ ctx[4],
    				colors: /*coaColors*/ ctx[10],
    				t: /*tDiv*/ ctx[15]
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
    			if (dirty & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty & /*coaShield*/ 16) charge_changes.shield = /*coaShield*/ ctx[4];
    			if (dirty & /*coaColors*/ 1024) charge_changes.colors = /*coaColors*/ ctx[10];
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
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(64:55) ",
    		ctx
    	});

    	return block;
    }

    // (62:6) {#if charge.layer === "field"}
    function create_if_block_11(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[25],
    				i: /*i*/ ctx[3],
    				shield: /*coaShield*/ ctx[4],
    				colors: /*coaColors*/ ctx[10],
    				t: /*charge*/ ctx[25].t
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
    			if (dirty & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty & /*coaShield*/ 16) charge_changes.shield = /*coaShield*/ ctx[4];
    			if (dirty & /*coaColors*/ 1024) charge_changes.colors = /*coaColors*/ ctx[10];
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
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(62:6) {#if charge.layer === \\\"field\\\"}",
    		ctx
    	});

    	return block;
    }

    // (61:4) {#each charges as charge, i}
    function create_each_block_2$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_11, create_if_block_12];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*charge*/ ctx[25].layer === "field") return 0;
    		if (/*charge*/ ctx[25].layer === "counter" && /*division*/ ctx[13]) return 1;
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
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(61:4) {#each charges as charge, i}",
    		ctx
    	});

    	return block;
    }

    // (70:4) {#if division}
    function create_if_block_4$1(ctx) {
    	let g;
    	let rect;
    	let rect_fill_value;
    	let if_block0_anchor;
    	let if_block1_anchor;
    	let g_clip_path_value;
    	let current;
    	let if_block0 = /*ordinary*/ ctx[12]?.divided && create_if_block_8(ctx);
    	let if_block1 = /*diaperType*/ ctx[7] === "division" && create_if_block_7$1(ctx);
    	let each_value_1 = /*charges*/ ctx[14];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			rect = svg_element("rect");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "200");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", rect_fill_value = /*coaColors*/ ctx[10][/*tDiv*/ ctx[15]] || /*clr*/ ctx[16](/*tDiv*/ ctx[15]));
    			add_location(rect, file$7, 71, 8, 2904);
    			attr_dev(g, "id", "division");
    			attr_dev(g, "clip-path", g_clip_path_value = "url(#divisionClip" + /*i*/ ctx[3] + ")");
    			add_location(g, file$7, 70, 6, 2843);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, rect);
    			if (if_block0) if_block0.m(g, null);
    			append_dev(g, if_block0_anchor);
    			if (if_block1) if_block1.m(g, null);
    			append_dev(g, if_block1_anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*coaColors*/ 1024 && rect_fill_value !== (rect_fill_value = /*coaColors*/ ctx[10][/*tDiv*/ ctx[15]] || /*clr*/ ctx[16](/*tDiv*/ ctx[15]))) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (/*ordinary*/ ctx[12]?.divided) if_block0.p(ctx, dirty);

    			if (/*diaperType*/ ctx[7] === "division") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_7$1(ctx);
    					if_block1.c();
    					if_block1.m(g, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*coa, charges, coaShield, coaColors*/ 17425) {
    				each_value_1 = /*charges*/ ctx[14];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(g, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*i*/ 8 && g_clip_path_value !== (g_clip_path_value = "url(#divisionClip" + /*i*/ ctx[3] + ")")) {
    				attr_dev(g, "clip-path", g_clip_path_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(70:4) {#if division}",
    		ctx
    	});

    	return block;
    }

    // (73:8) {#if ordinary?.divided}
    function create_if_block_8(ctx) {
    	let if_block0_anchor;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*ordinary*/ ctx[12].divided === "counter" && create_if_block_10(ctx);
    	let if_block1 = /*ordinary*/ ctx[12].divided === "division" && create_if_block_9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, if_block0_anchor, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*ordinary*/ ctx[12].divided === "counter") if_block0.p(ctx, dirty);
    			if (/*ordinary*/ ctx[12].divided === "division") if_block1.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(if_block0_anchor);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(73:8) {#if ordinary?.divided}",
    		ctx
    	});

    	return block;
    }

    // (74:10) {#if ordinary.divided === "counter"}
    function create_if_block_10(ctx) {
    	let ordinary_1;
    	let current;

    	ordinary_1 = new Ordinary({
    			props: {
    				ordinary: /*ordinary*/ ctx[12],
    				shieldPath: /*shieldPath*/ ctx[5],
    				colors: /*coaColors*/ ctx[10],
    				t: /*coa*/ ctx[0].t1
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_1_changes = {};
    			if (dirty & /*shieldPath*/ 32) ordinary_1_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty & /*coaColors*/ 1024) ordinary_1_changes.colors = /*coaColors*/ ctx[10];
    			if (dirty & /*coa*/ 1) ordinary_1_changes.t = /*coa*/ ctx[0].t1;
    			ordinary_1.$set(ordinary_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(74:10) {#if ordinary.divided === \\\"counter\\\"}",
    		ctx
    	});

    	return block;
    }

    // (75:10) {#if ordinary.divided === "division"}
    function create_if_block_9(ctx) {
    	let ordinary_1;
    	let current;

    	ordinary_1 = new Ordinary({
    			props: {
    				ordinary: /*ordinary*/ ctx[12],
    				shieldPath: /*shieldPath*/ ctx[5],
    				colors: /*coaColors*/ ctx[10],
    				t: /*ordinary*/ ctx[12].t
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_1_changes = {};
    			if (dirty & /*shieldPath*/ 32) ordinary_1_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty & /*coaColors*/ 1024) ordinary_1_changes.colors = /*coaColors*/ ctx[10];
    			ordinary_1.$set(ordinary_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(75:10) {#if ordinary.divided === \\\"division\\\"}",
    		ctx
    	});

    	return block;
    }

    // (77:8) {#if diaperType === "division"}
    function create_if_block_7$1(ctx) {
    	let rect;
    	let rect_fill_value;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "class", "diaper svelte-1i16020");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "200");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", rect_fill_value = "url(#" + /*coaDiaper*/ ctx[6] + ")");
    			add_location(rect, file$7, 76, 39, 3308);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*coaDiaper*/ 64 && rect_fill_value !== (rect_fill_value = "url(#" + /*coaDiaper*/ ctx[6] + ")")) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(77:8) {#if diaperType === \\\"division\\\"}",
    		ctx
    	});

    	return block;
    }

    // (81:47) 
    function create_if_block_6$1(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[25],
    				i: /*i*/ ctx[3],
    				shield: /*coaShield*/ ctx[4],
    				colors: /*coaColors*/ ctx[10],
    				t: /*coa*/ ctx[0].t1
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
    			if (dirty & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty & /*coaShield*/ 16) charge_changes.shield = /*coaShield*/ ctx[4];
    			if (dirty & /*coaColors*/ 1024) charge_changes.colors = /*coaColors*/ ctx[10];
    			if (dirty & /*coa*/ 1) charge_changes.t = /*coa*/ ctx[0].t1;
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
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(81:47) ",
    		ctx
    	});

    	return block;
    }

    // (79:10) {#if charge.layer === "division"}
    function create_if_block_5$1(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[25],
    				i: /*i*/ ctx[3],
    				shield: /*coaShield*/ ctx[4],
    				colors: /*coaColors*/ ctx[10],
    				t: /*charge*/ ctx[25].t
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
    			if (dirty & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty & /*coaShield*/ 16) charge_changes.shield = /*coaShield*/ ctx[4];
    			if (dirty & /*coaColors*/ 1024) charge_changes.colors = /*coaColors*/ ctx[10];
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
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(79:10) {#if charge.layer === \\\"division\\\"}",
    		ctx
    	});

    	return block;
    }

    // (78:8) {#each charges as charge, i}
    function create_each_block_1$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_5$1, create_if_block_6$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*charge*/ ctx[25].layer === "division") return 0;
    		if (/*charge*/ ctx[25].layer === "counter") return 1;
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
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(78:8) {#each charges as charge, i}",
    		ctx
    	});

    	return block;
    }

    // (89:4) {#if ordinary && !ordinary.divided}
    function create_if_block_3$1(ctx) {
    	let ordinary_1;
    	let current;

    	ordinary_1 = new Ordinary({
    			props: {
    				ordinary: /*ordinary*/ ctx[12],
    				shieldPath: /*shieldPath*/ ctx[5],
    				colors: /*coaColors*/ ctx[10],
    				t: /*ordinary*/ ctx[12].t
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_1_changes = {};
    			if (dirty & /*shieldPath*/ 32) ordinary_1_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty & /*coaColors*/ 1024) ordinary_1_changes.colors = /*coaColors*/ ctx[10];
    			ordinary_1.$set(ordinary_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(89:4) {#if ordinary && !ordinary.divided}",
    		ctx
    	});

    	return block;
    }

    // (92:4) {#if diaperType === "overall"}
    function create_if_block_2$1(ctx) {
    	let rect;
    	let rect_fill_value;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "class", "diaper svelte-1i16020");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "200");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", rect_fill_value = "url(#" + /*coaDiaper*/ ctx[6] + ")");
    			add_location(rect, file$7, 91, 34, 3957);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*coaDiaper*/ 64 && rect_fill_value !== (rect_fill_value = "url(#" + /*coaDiaper*/ ctx[6] + ")")) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(92:4) {#if diaperType === \\\"overall\\\"}",
    		ctx
    	});

    	return block;
    }

    // (94:6) {#if !charge.layer}
    function create_if_block_1$2(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[25],
    				i: /*i*/ ctx[3],
    				shield: /*coaShield*/ ctx[4],
    				colors: /*coaColors*/ ctx[10],
    				t: /*charge*/ ctx[25].t
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
    			if (dirty & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty & /*coaShield*/ 16) charge_changes.shield = /*coaShield*/ ctx[4];
    			if (dirty & /*coaColors*/ 1024) charge_changes.colors = /*coaColors*/ ctx[10];
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(94:6) {#if !charge.layer}",
    		ctx
    	});

    	return block;
    }

    // (93:4) {#each charges as charge, i}
    function create_each_block$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !/*charge*/ ctx[25].layer && create_if_block_1$2(ctx);

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
    			if (!/*charge*/ ctx[25].layer) if_block.p(ctx, dirty);
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
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(93:4) {#each charges as charge, i}",
    		ctx
    	});

    	return block;
    }

    // (100:2) {#if i === "Edit"}
    function create_if_block$5(ctx) {
    	let positions;
    	let current;
    	positions = new Positions({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(positions.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(positions, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(positions.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(positions.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(positions, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(100:2) {#if i === \\\"Edit\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let svg;
    	let defs;
    	let g;
    	let rect;
    	let rect_fill_value;
    	let if_block1_anchor;
    	let if_block2_anchor;
    	let each0_anchor;
    	let if_block3_anchor;
    	let if_block4_anchor;
    	let if_block5_anchor;
    	let g_clip_path_value;
    	let path;
    	let path_fill_value;
    	let svg_id_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*division*/ ctx[13] && create_if_block_17(ctx);
    	let if_block1 = /*division*/ ctx[13] && /*ordinary*/ ctx[12]?.divided && create_if_block_14(ctx);
    	let if_block2 = /*diaperType*/ ctx[7] === "field" && create_if_block_13(ctx);
    	let each_value_2 = /*charges*/ ctx[14];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let if_block3 = /*division*/ ctx[13] && create_if_block_4$1(ctx);
    	let if_block4 = /*ordinary*/ ctx[12] && !/*ordinary*/ ctx[12].divided && create_if_block_3$1(ctx);
    	let if_block5 = /*diaperType*/ ctx[7] === "overall" && create_if_block_2$1(ctx);
    	let each_value = /*charges*/ ctx[14];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block6 = /*i*/ ctx[3] === "Edit" && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			if (if_block0) if_block0.c();
    			g = svg_element("g");
    			rect = svg_element("rect");
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			each0_anchor = empty();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    			if (if_block4) if_block4.c();
    			if_block4_anchor = empty();
    			if (if_block5) if_block5.c();
    			if_block5_anchor = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (if_block6) if_block6.c();
    			path = svg_element("path");
    			add_location(defs, file$7, 44, 2, 1719);
    			attr_dev(rect, "id", "field");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "200");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", rect_fill_value = /*coaColors*/ ctx[10][/*coa*/ ctx[0].t1] || /*clr*/ ctx[16](/*coa*/ ctx[0].t1));
    			add_location(rect, file$7, 54, 4, 1971);
    			attr_dev(g, "id", "shield");
    			attr_dev(g, "clip-path", g_clip_path_value = "url(#" + /*coaShield*/ ctx[4] + ")");
    			add_location(g, file$7, 51, 2, 1892);
    			attr_dev(path, "class", "grad svelte-1i16020");
    			attr_dev(path, "d", /*shieldPath*/ ctx[5]);
    			attr_dev(path, "fill", path_fill_value = "url(#" + /*coaGrad*/ ctx[9] + ")");
    			attr_dev(path, "stroke", /*$border*/ ctx[11]);
    			attr_dev(path, "stroke-width", /*strokeWidth*/ ctx[8]);
    			add_location(path, file$7, 101, 2, 4269);
    			attr_dev(svg, "id", svg_id_value = "coa" + /*i*/ ctx[3]);
    			attr_dev(svg, "class", "coa");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*w*/ ctx[1]);
    			attr_dev(svg, "height", /*h*/ ctx[2]);
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			add_location(svg, file$7, 43, 0, 1574);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);
    			if (if_block0) if_block0.m(defs, null);
    			append_dev(svg, g);
    			append_dev(g, rect);
    			if (if_block1) if_block1.m(g, null);
    			append_dev(g, if_block1_anchor);
    			if (if_block2) if_block2.m(g, null);
    			append_dev(g, if_block2_anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g, null);
    			}

    			append_dev(g, each0_anchor);
    			if (if_block3) if_block3.m(g, null);
    			append_dev(g, if_block3_anchor);
    			if (if_block4) if_block4.m(g, null);
    			append_dev(g, if_block4_anchor);
    			if (if_block5) if_block5.m(g, null);
    			append_dev(g, if_block5_anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			if (if_block6) if_block6.m(svg, null);
    			append_dev(svg, path);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", /*click_handler*/ ctx[17], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*division*/ ctx[13]) if_block0.p(ctx, dirty);

    			if (!current || dirty & /*coaColors, coa*/ 1025 && rect_fill_value !== (rect_fill_value = /*coaColors*/ ctx[10][/*coa*/ ctx[0].t1] || /*clr*/ ctx[16](/*coa*/ ctx[0].t1))) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (/*division*/ ctx[13] && /*ordinary*/ ctx[12]?.divided) if_block1.p(ctx, dirty);

    			if (/*diaperType*/ ctx[7] === "field") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_13(ctx);
    					if_block2.c();
    					if_block2.m(g, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*coa, charges, coaShield, coaColors, tDiv, division*/ 58385) {
    				each_value_2 = /*charges*/ ctx[14];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_2$1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(g, each0_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*division*/ ctx[13]) if_block3.p(ctx, dirty);
    			if (/*ordinary*/ ctx[12] && !/*ordinary*/ ctx[12].divided) if_block4.p(ctx, dirty);

    			if (/*diaperType*/ ctx[7] === "overall") {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_2$1(ctx);
    					if_block5.c();
    					if_block5.m(g, if_block5_anchor);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (dirty & /*coa, charges, coaShield, coaColors*/ 17425) {
    				each_value = /*charges*/ ctx[14];
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
    						each_blocks[i].m(g, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*coaShield*/ 16 && g_clip_path_value !== (g_clip_path_value = "url(#" + /*coaShield*/ ctx[4] + ")")) {
    				attr_dev(g, "clip-path", g_clip_path_value);
    			}

    			if (/*i*/ ctx[3] === "Edit") {
    				if (if_block6) {
    					if (dirty & /*i*/ 8) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block$5(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(svg, path);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*shieldPath*/ 32) {
    				attr_dev(path, "d", /*shieldPath*/ ctx[5]);
    			}

    			if (!current || dirty & /*coaGrad*/ 512 && path_fill_value !== (path_fill_value = "url(#" + /*coaGrad*/ ctx[9] + ")")) {
    				attr_dev(path, "fill", path_fill_value);
    			}

    			if (!current || dirty & /*$border*/ 2048) {
    				attr_dev(path, "stroke", /*$border*/ ctx[11]);
    			}

    			if (!current || dirty & /*strokeWidth*/ 256) {
    				attr_dev(path, "stroke-width", /*strokeWidth*/ ctx[8]);
    			}

    			if (!current || dirty & /*i*/ 8 && svg_id_value !== (svg_id_value = "coa" + /*i*/ ctx[3])) {
    				attr_dev(svg, "id", svg_id_value);
    			}

    			if (!current || dirty & /*w*/ 2) {
    				attr_dev(svg, "width", /*w*/ ctx[1]);
    			}

    			if (!current || dirty & /*h*/ 4) {
    				attr_dev(svg, "height", /*h*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(if_block3);
    			transition_in(if_block4);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block6);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(if_block3);
    			transition_out(if_block4);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block6);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			destroy_each(each_blocks_1, detaching);
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block6) if_block6.d();
    			mounted = false;
    			dispose();
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

    function getTemplate$1(templateId, lineId) {
    	if (!lineId) return document.getElementById(templateId)?.innerHTML;
    	const template = document.getElementById(templateId);

    	const line = document.getElementById(lineId)
    	? document.getElementById(lineId)
    	: document.getElementById("straight");

    	return template.innerHTML.replace(/{line}/g, line.getAttribute("d")).replace(/dpath/g, "d");
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $shield;
    	let $diaper;
    	let $borderWidth;
    	let $grad;
    	let $colors;
    	let $patterns;
    	let $border;
    	validate_store(shield, "shield");
    	component_subscribe($$self, shield, $$value => $$invalidate(18, $shield = $$value));
    	validate_store(diaper, "diaper");
    	component_subscribe($$self, diaper, $$value => $$invalidate(19, $diaper = $$value));
    	validate_store(borderWidth, "borderWidth");
    	component_subscribe($$self, borderWidth, $$value => $$invalidate(20, $borderWidth = $$value));
    	validate_store(grad, "grad");
    	component_subscribe($$self, grad, $$value => $$invalidate(21, $grad = $$value));
    	validate_store(colors, "colors");
    	component_subscribe($$self, colors, $$value => $$invalidate(22, $colors = $$value));
    	validate_store(patterns, "patterns");
    	component_subscribe($$self, patterns, $$value => $$invalidate(23, $patterns = $$value));
    	validate_store(border, "border");
    	component_subscribe($$self, border, $$value => $$invalidate(11, $border = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("COA", slots, []);
    	let { coa } = $$props, { i } = $$props, { w } = $$props, { h } = $$props;
    	const { ordinary, division, charges = [] } = coa;
    	const tDiv = division ? division.t : "";

    	function getDieperType() {
    		const f = !coa.t1.includes("-");
    		const d = !tDiv.includes("-");
    		if (f && d) return "overall";
    		if (f) return "field";
    		if (d) return "division";
    		return null;
    	}

    	// get color or link to pattern
    	function clr(tincture) {
    		if (coaColors[tincture]) return coaColors[tincture];
    		if (!tincture) debugger;
    		set_store_value(patterns, $patterns[$patterns.length] = tincture, $patterns);
    		return "url(#" + tincture + ")";
    	}

    	const writable_props = ["coa", "i", "w", "h"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<COA> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => console.log(coa);

    	$$self.$$set = $$props => {
    		if ("coa" in $$props) $$invalidate(0, coa = $$props.coa);
    		if ("i" in $$props) $$invalidate(3, i = $$props.i);
    		if ("w" in $$props) $$invalidate(1, w = $$props.w);
    		if ("h" in $$props) $$invalidate(2, h = $$props.h);
    	};

    	$$self.$capture_state = () => ({
    		Ordinary,
    		Charge,
    		Positions,
    		grad,
    		diaper,
    		shield,
    		colors,
    		border,
    		borderWidth,
    		patterns,
    		coa,
    		i,
    		w,
    		h,
    		ordinary,
    		division,
    		charges,
    		tDiv,
    		getDieperType,
    		getTemplate: getTemplate$1,
    		clr,
    		coaShield,
    		$shield,
    		shieldPath,
    		coaDiaper,
    		$diaper,
    		diaperType,
    		strokeWidth,
    		$borderWidth,
    		coaGrad,
    		$grad,
    		coaColors,
    		$colors,
    		$patterns,
    		$border
    	});

    	$$self.$inject_state = $$props => {
    		if ("coa" in $$props) $$invalidate(0, coa = $$props.coa);
    		if ("i" in $$props) $$invalidate(3, i = $$props.i);
    		if ("w" in $$props) $$invalidate(1, w = $$props.w);
    		if ("h" in $$props) $$invalidate(2, h = $$props.h);
    		if ("coaShield" in $$props) $$invalidate(4, coaShield = $$props.coaShield);
    		if ("shieldPath" in $$props) $$invalidate(5, shieldPath = $$props.shieldPath);
    		if ("coaDiaper" in $$props) $$invalidate(6, coaDiaper = $$props.coaDiaper);
    		if ("diaperType" in $$props) $$invalidate(7, diaperType = $$props.diaperType);
    		if ("strokeWidth" in $$props) $$invalidate(8, strokeWidth = $$props.strokeWidth);
    		if ("coaGrad" in $$props) $$invalidate(9, coaGrad = $$props.coaGrad);
    		if ("coaColors" in $$props) $$invalidate(10, coaColors = $$props.coaColors);
    	};

    	let coaShield;
    	let shieldPath;
    	let coaDiaper;
    	let diaperType;
    	let strokeWidth;
    	let coaGrad;
    	let coaColors;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*coa, $shield*/ 262145) {
    			 $$invalidate(4, coaShield = coa.shield || $shield);
    		}

    		if ($$self.$$.dirty & /*coaShield*/ 16) {
    			 $$invalidate(5, shieldPath = document.querySelector(`#defs g#shields > #${coaShield} > path`).getAttribute("d"));
    		}

    		if ($$self.$$.dirty & /*coa, $diaper*/ 524289) {
    			 $$invalidate(6, coaDiaper = coa.diaper || $diaper);
    		}

    		if ($$self.$$.dirty & /*coaDiaper*/ 64) {
    			 $$invalidate(7, diaperType = coaDiaper ? getDieperType() : null);
    		}

    		if ($$self.$$.dirty & /*$borderWidth*/ 1048576) {
    			 $$invalidate(8, strokeWidth = $borderWidth);
    		}

    		if ($$self.$$.dirty & /*coa, $grad*/ 2097153) {
    			 $$invalidate(9, coaGrad = coa.grad || $grad);
    		}

    		if ($$self.$$.dirty & /*$colors*/ 4194304) {
    			 $$invalidate(10, coaColors = $colors);
    		}
    	};

    	return [
    		coa,
    		w,
    		h,
    		i,
    		coaShield,
    		shieldPath,
    		coaDiaper,
    		diaperType,
    		strokeWidth,
    		coaGrad,
    		coaColors,
    		$border,
    		ordinary,
    		division,
    		charges,
    		tDiv,
    		clr,
    		click_handler
    	];
    }

    class COA extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { coa: 0, i: 3, w: 1, h: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "COA",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*coa*/ ctx[0] === undefined && !("coa" in props)) {
    			console_1.warn("<COA> was created without expected prop 'coa'");
    		}

    		if (/*i*/ ctx[3] === undefined && !("i" in props)) {
    			console_1.warn("<COA> was created without expected prop 'i'");
    		}

    		if (/*w*/ ctx[1] === undefined && !("w" in props)) {
    			console_1.warn("<COA> was created without expected prop 'w'");
    		}

    		if (/*h*/ ctx[2] === undefined && !("h" in props)) {
    			console_1.warn("<COA> was created without expected prop 'h'");
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

    /* src\MenuItem.svelte generated by Svelte v3.29.4 */
    const file$8 = "src\\MenuItem.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    function get_each_context_2$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (35:4) {#if division && division.division !== "no"}
    function create_if_block_13$1(ctx) {
    	let clipPath;
    	let raw_value = getTemplate$2(/*division*/ ctx[7].division, /*division*/ ctx[7].line) + "";
    	let clipPath_id_value;

    	const block = {
    		c: function create() {
    			clipPath = svg_element("clipPath");
    			attr_dev(clipPath, "id", clipPath_id_value = "divisionClipMenu" + /*i*/ ctx[11]);
    			add_location(clipPath, file$8, 35, 6, 1413);
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
    		id: create_if_block_13$1.name,
    		type: "if",
    		source: "(35:4) {#if division && division.division !== \\\"no\\\"}",
    		ctx
    	});

    	return block;
    }

    // (45:4) {#if division && ordinary?.divided}
    function create_if_block_10$1(ctx) {
    	let if_block0_anchor;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*ordinary*/ ctx[3].divided === "counter" && create_if_block_12$1(ctx);
    	let if_block1 = /*ordinary*/ ctx[3].divided === "field" && create_if_block_11$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, if_block0_anchor, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*ordinary*/ ctx[3].divided === "counter") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*ordinary*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_12$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*ordinary*/ ctx[3].divided === "field") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*ordinary*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_11$1(ctx);
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
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(if_block0_anchor);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$1.name,
    		type: "if",
    		source: "(45:4) {#if division && ordinary?.divided}",
    		ctx
    	});

    	return block;
    }

    // (46:6) {#if ordinary.divided === "counter"}
    function create_if_block_12$1(ctx) {
    	let ordinary_1;
    	let current;

    	ordinary_1 = new Ordinary({
    			props: {
    				ordinary: /*ordinary*/ ctx[3],
    				shieldPath: /*shieldPath*/ ctx[5],
    				colors: /*coaColors*/ ctx[6],
    				t: /*tDiv*/ ctx[9]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_1_changes = {};
    			if (dirty & /*ordinary*/ 8) ordinary_1_changes.ordinary = /*ordinary*/ ctx[3];
    			if (dirty & /*shieldPath*/ 32) ordinary_1_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty & /*coaColors*/ 64) ordinary_1_changes.colors = /*coaColors*/ ctx[6];
    			ordinary_1.$set(ordinary_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$1.name,
    		type: "if",
    		source: "(46:6) {#if ordinary.divided === \\\"counter\\\"}",
    		ctx
    	});

    	return block;
    }

    // (47:6) {#if ordinary.divided === "field"}
    function create_if_block_11$1(ctx) {
    	let ordinary_1;
    	let current;

    	ordinary_1 = new Ordinary({
    			props: {
    				ordinary: /*ordinary*/ ctx[3],
    				shieldPath: /*shieldPath*/ ctx[5],
    				colors: /*coaColors*/ ctx[6],
    				t: /*ordinary*/ ctx[3].t
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_1_changes = {};
    			if (dirty & /*ordinary*/ 8) ordinary_1_changes.ordinary = /*ordinary*/ ctx[3];
    			if (dirty & /*shieldPath*/ 32) ordinary_1_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty & /*coaColors*/ 64) ordinary_1_changes.colors = /*coaColors*/ ctx[6];
    			if (dirty & /*ordinary*/ 8) ordinary_1_changes.t = /*ordinary*/ ctx[3].t;
    			ordinary_1.$set(ordinary_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$1.name,
    		type: "if",
    		source: "(47:6) {#if ordinary.divided === \\\"field\\\"}",
    		ctx
    	});

    	return block;
    }

    // (52:55) 
    function create_if_block_9$1(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[15],
    				i: /*i*/ ctx[11],
    				shield: /*coaShield*/ ctx[4],
    				colors: /*coaColors*/ ctx[6],
    				t: /*tDiv*/ ctx[9]
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
    			if (dirty & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty & /*coaShield*/ 16) charge_changes.shield = /*coaShield*/ ctx[4];
    			if (dirty & /*coaColors*/ 64) charge_changes.colors = /*coaColors*/ ctx[6];
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
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(52:55) ",
    		ctx
    	});

    	return block;
    }

    // (50:6) {#if charge.layer === "field"}
    function create_if_block_8$1(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[15],
    				i: /*i*/ ctx[11],
    				shield: /*coaShield*/ ctx[4],
    				colors: /*coaColors*/ ctx[6],
    				t: /*charge*/ ctx[15].t
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
    			if (dirty & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty & /*coaShield*/ 16) charge_changes.shield = /*coaShield*/ ctx[4];
    			if (dirty & /*coaColors*/ 64) charge_changes.colors = /*coaColors*/ ctx[6];
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
    		source: "(50:6) {#if charge.layer === \\\"field\\\"}",
    		ctx
    	});

    	return block;
    }

    // (49:4) {#each charges as charge, i}
    function create_each_block_2$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_8$1, create_if_block_9$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*charge*/ ctx[15].layer === "field") return 0;
    		if (/*charge*/ ctx[15].layer === "counter" && /*division*/ ctx[7]) return 1;
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
    		id: create_each_block_2$2.name,
    		type: "each",
    		source: "(49:4) {#each charges as charge, i}",
    		ctx
    	});

    	return block;
    }

    // (58:4) {#if division && division.division !== "no"}
    function create_if_block_2$2(ctx) {
    	let g;
    	let rect;
    	let rect_fill_value;
    	let if_block_anchor;
    	let g_clip_path_value;
    	let current;
    	let if_block = /*ordinary*/ ctx[3]?.divided && create_if_block_5$2(ctx);
    	let each_value_1 = /*charges*/ ctx[8];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			rect = svg_element("rect");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "200");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", rect_fill_value = /*coaColors*/ ctx[6][/*tDiv*/ ctx[9]] || /*clr*/ ctx[10](/*tDiv*/ ctx[9]));
    			add_location(rect, file$8, 59, 8, 2487);
    			attr_dev(g, "id", "division");
    			attr_dev(g, "clip-path", g_clip_path_value = "url(#divisionClipMenu" + /*i*/ ctx[11] + ")");
    			add_location(g, file$8, 58, 6, 2422);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, rect);
    			if (if_block) if_block.m(g, null);
    			append_dev(g, if_block_anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*coaColors*/ 64 && rect_fill_value !== (rect_fill_value = /*coaColors*/ ctx[6][/*tDiv*/ ctx[9]] || /*clr*/ ctx[10](/*tDiv*/ ctx[9]))) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (/*ordinary*/ ctx[3]?.divided) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*ordinary*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_5$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(g, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*coa, charges, coaShield, coaColors*/ 337) {
    				each_value_1 = /*charges*/ ctx[8];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(g, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(58:4) {#if division && division.division !== \\\"no\\\"}",
    		ctx
    	});

    	return block;
    }

    // (61:8) {#if ordinary?.divided}
    function create_if_block_5$2(ctx) {
    	let if_block0_anchor;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*ordinary*/ ctx[3].divided === "counter" && create_if_block_7$2(ctx);
    	let if_block1 = /*ordinary*/ ctx[3].divided === "division" && create_if_block_6$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, if_block0_anchor, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*ordinary*/ ctx[3].divided === "counter") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*ordinary*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*ordinary*/ ctx[3].divided === "division") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*ordinary*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_6$2(ctx);
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
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(if_block0_anchor);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(61:8) {#if ordinary?.divided}",
    		ctx
    	});

    	return block;
    }

    // (62:10) {#if ordinary.divided === "counter"}
    function create_if_block_7$2(ctx) {
    	let ordinary_1;
    	let current;

    	ordinary_1 = new Ordinary({
    			props: {
    				ordinary: /*ordinary*/ ctx[3],
    				shieldPath: /*shieldPath*/ ctx[5],
    				colors: /*coaColors*/ ctx[6],
    				t: /*coa*/ ctx[0].t1
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_1_changes = {};
    			if (dirty & /*ordinary*/ 8) ordinary_1_changes.ordinary = /*ordinary*/ ctx[3];
    			if (dirty & /*shieldPath*/ 32) ordinary_1_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty & /*coaColors*/ 64) ordinary_1_changes.colors = /*coaColors*/ ctx[6];
    			if (dirty & /*coa*/ 1) ordinary_1_changes.t = /*coa*/ ctx[0].t1;
    			ordinary_1.$set(ordinary_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(62:10) {#if ordinary.divided === \\\"counter\\\"}",
    		ctx
    	});

    	return block;
    }

    // (63:10) {#if ordinary.divided === "division"}
    function create_if_block_6$2(ctx) {
    	let ordinary_1;
    	let current;

    	ordinary_1 = new Ordinary({
    			props: {
    				ordinary: /*ordinary*/ ctx[3],
    				shieldPath: /*shieldPath*/ ctx[5],
    				colors: /*coaColors*/ ctx[6],
    				t: /*ordinary*/ ctx[3].t
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_1_changes = {};
    			if (dirty & /*ordinary*/ 8) ordinary_1_changes.ordinary = /*ordinary*/ ctx[3];
    			if (dirty & /*shieldPath*/ 32) ordinary_1_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty & /*coaColors*/ 64) ordinary_1_changes.colors = /*coaColors*/ ctx[6];
    			if (dirty & /*ordinary*/ 8) ordinary_1_changes.t = /*ordinary*/ ctx[3].t;
    			ordinary_1.$set(ordinary_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(63:10) {#if ordinary.divided === \\\"division\\\"}",
    		ctx
    	});

    	return block;
    }

    // (68:47) 
    function create_if_block_4$2(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[15],
    				i: /*i*/ ctx[11],
    				shield: /*coaShield*/ ctx[4],
    				colors: /*coaColors*/ ctx[6],
    				t: /*coa*/ ctx[0].t1
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
    			if (dirty & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty & /*coaShield*/ 16) charge_changes.shield = /*coaShield*/ ctx[4];
    			if (dirty & /*coaColors*/ 64) charge_changes.colors = /*coaColors*/ ctx[6];
    			if (dirty & /*coa*/ 1) charge_changes.t = /*coa*/ ctx[0].t1;
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
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(68:47) ",
    		ctx
    	});

    	return block;
    }

    // (66:10) {#if charge.layer === "division"}
    function create_if_block_3$2(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[15],
    				i: /*i*/ ctx[11],
    				shield: /*coaShield*/ ctx[4],
    				colors: /*coaColors*/ ctx[6],
    				t: /*charge*/ ctx[15].t
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
    			if (dirty & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty & /*coaShield*/ 16) charge_changes.shield = /*coaShield*/ ctx[4];
    			if (dirty & /*coaColors*/ 64) charge_changes.colors = /*coaColors*/ ctx[6];
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
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(66:10) {#if charge.layer === \\\"division\\\"}",
    		ctx
    	});

    	return block;
    }

    // (65:8) {#each charges as charge, i}
    function create_each_block_1$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3$2, create_if_block_4$2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*charge*/ ctx[15].layer === "division") return 0;
    		if (/*charge*/ ctx[15].layer === "counter") return 1;
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
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(65:8) {#each charges as charge, i}",
    		ctx
    	});

    	return block;
    }

    // (76:4) {#if ordinary && !ordinary.divided}
    function create_if_block_1$3(ctx) {
    	let ordinary_1;
    	let current;

    	ordinary_1 = new Ordinary({
    			props: {
    				ordinary: /*ordinary*/ ctx[3],
    				shieldPath: /*shieldPath*/ ctx[5],
    				colors: /*coaColors*/ ctx[6],
    				t: /*ordinary*/ ctx[3].t
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ordinary_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ordinary_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ordinary_1_changes = {};
    			if (dirty & /*ordinary*/ 8) ordinary_1_changes.ordinary = /*ordinary*/ ctx[3];
    			if (dirty & /*shieldPath*/ 32) ordinary_1_changes.shieldPath = /*shieldPath*/ ctx[5];
    			if (dirty & /*coaColors*/ 64) ordinary_1_changes.colors = /*coaColors*/ ctx[6];
    			if (dirty & /*ordinary*/ 8) ordinary_1_changes.t = /*ordinary*/ ctx[3].t;
    			ordinary_1.$set(ordinary_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ordinary_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ordinary_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ordinary_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(76:4) {#if ordinary && !ordinary.divided}",
    		ctx
    	});

    	return block;
    }

    // (80:6) {#if !charge.layer}
    function create_if_block$6(ctx) {
    	let charge;
    	let current;

    	charge = new Charge({
    			props: {
    				coa: /*coa*/ ctx[0],
    				charge: /*charge*/ ctx[15],
    				i: /*i*/ ctx[11],
    				shield: /*coaShield*/ ctx[4],
    				colors: /*coaColors*/ ctx[6],
    				t: /*charge*/ ctx[15].t
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
    			if (dirty & /*coa*/ 1) charge_changes.coa = /*coa*/ ctx[0];
    			if (dirty & /*coaShield*/ 16) charge_changes.shield = /*coaShield*/ ctx[4];
    			if (dirty & /*coaColors*/ 64) charge_changes.colors = /*coaColors*/ ctx[6];
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
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(80:6) {#if !charge.layer}",
    		ctx
    	});

    	return block;
    }

    // (79:4) {#each charges as charge, i}
    function create_each_block$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !/*charge*/ ctx[15].layer && create_if_block$6(ctx);

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
    			if (!/*charge*/ ctx[15].layer) if_block.p(ctx, dirty);
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
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(79:4) {#each charges as charge, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let svg;
    	let title_1;
    	let t;
    	let defs;
    	let g;
    	let rect;
    	let rect_fill_value;
    	let if_block1_anchor;
    	let each0_anchor;
    	let if_block2_anchor;
    	let if_block3_anchor;
    	let g_clip_path_value;
    	let path;
    	let current;
    	let if_block0 = /*division*/ ctx[7] && /*division*/ ctx[7].division !== "no" && create_if_block_13$1(ctx);
    	let if_block1 = /*division*/ ctx[7] && /*ordinary*/ ctx[3]?.divided && create_if_block_10$1(ctx);
    	let each_value_2 = /*charges*/ ctx[8];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let if_block2 = /*division*/ ctx[7] && /*division*/ ctx[7].division !== "no" && create_if_block_2$2(ctx);
    	let if_block3 = /*ordinary*/ ctx[3] && !/*ordinary*/ ctx[3].divided && create_if_block_1$3(ctx);
    	let each_value = /*charges*/ ctx[8];
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
    			svg = svg_element("svg");
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			defs = svg_element("defs");
    			if (if_block0) if_block0.c();
    			g = svg_element("g");
    			rect = svg_element("rect");
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			each0_anchor = empty();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			path = svg_element("path");
    			add_location(title_1, file$8, 32, 2, 1323);
    			add_location(defs, file$8, 33, 2, 1349);
    			attr_dev(rect, "id", "field");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "200");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", rect_fill_value = /*coaColors*/ ctx[6][/*coa*/ ctx[0].t1] || /*clr*/ ctx[10](/*coa*/ ctx[0].t1));
    			add_location(rect, file$8, 43, 4, 1635);
    			attr_dev(g, "id", "shield");
    			attr_dev(g, "clip-path", g_clip_path_value = "url(#" + /*coaShield*/ ctx[4] + ")");
    			add_location(g, file$8, 40, 2, 1556);
    			attr_dev(path, "d", /*shieldPath*/ ctx[5]);
    			attr_dev(path, "fill", "url(#spotlight)");
    			attr_dev(path, "stroke", "#333");
    			attr_dev(path, "stroke-width", "2");
    			add_location(path, file$8, 85, 2, 3572);
    			attr_dev(svg, "class", "menuItem");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*itemSize*/ ctx[2]);
    			attr_dev(svg, "height", /*itemSize*/ ctx[2]);
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			add_location(svg, file$8, 31, 0, 1205);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, title_1);
    			append_dev(title_1, t);
    			append_dev(svg, defs);
    			if (if_block0) if_block0.m(defs, null);
    			append_dev(svg, g);
    			append_dev(g, rect);
    			if (if_block1) if_block1.m(g, null);
    			append_dev(g, if_block1_anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g, null);
    			}

    			append_dev(g, each0_anchor);
    			if (if_block2) if_block2.m(g, null);
    			append_dev(g, if_block2_anchor);
    			if (if_block3) if_block3.m(g, null);
    			append_dev(g, if_block3_anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			append_dev(svg, path);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    			if (/*division*/ ctx[7] && /*division*/ ctx[7].division !== "no") if_block0.p(ctx, dirty);

    			if (!current || dirty & /*coaColors, coa*/ 65 && rect_fill_value !== (rect_fill_value = /*coaColors*/ ctx[6][/*coa*/ ctx[0].t1] || /*clr*/ ctx[10](/*coa*/ ctx[0].t1))) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (/*division*/ ctx[7] && /*ordinary*/ ctx[3]?.divided) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*ordinary*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_10$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(g, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*coa, charges, coaShield, coaColors, tDiv, division*/ 977) {
    				each_value_2 = /*charges*/ ctx[8];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_2$2(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(g, each0_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*division*/ ctx[7] && /*division*/ ctx[7].division !== "no") if_block2.p(ctx, dirty);

    			if (/*ordinary*/ ctx[3] && !/*ordinary*/ ctx[3].divided) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*ordinary*/ 8) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_1$3(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(g, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*coa, charges, coaShield, coaColors*/ 337) {
    				each_value = /*charges*/ ctx[8];
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
    						each_blocks[i].m(g, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*coaShield*/ 16 && g_clip_path_value !== (g_clip_path_value = "url(#" + /*coaShield*/ ctx[4] + ")")) {
    				attr_dev(g, "clip-path", g_clip_path_value);
    			}

    			if (!current || dirty & /*shieldPath*/ 32) {
    				attr_dev(path, "d", /*shieldPath*/ ctx[5]);
    			}

    			if (!current || dirty & /*itemSize*/ 4) {
    				attr_dev(svg, "width", /*itemSize*/ ctx[2]);
    			}

    			if (!current || dirty & /*itemSize*/ 4) {
    				attr_dev(svg, "height", /*itemSize*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(if_block2);
    			transition_in(if_block3);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(if_block2);
    			transition_out(if_block3);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks_1, detaching);
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			destroy_each(each_blocks, detaching);
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

    function getTemplate$2(templateId, lineId) {
    	if (!lineId) return document.getElementById(templateId)?.innerHTML;
    	const template = document.getElementById(templateId);

    	const line = document.getElementById(lineId)
    	? document.getElementById(lineId)
    	: document.getElementById("straight");

    	return template.innerHTML.replace(/{line}/g, line.getAttribute("d")).replace(/dpath/g, "d");
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $shield;
    	let $colors;
    	let $patterns;
    	validate_store(shield, "shield");
    	component_subscribe($$self, shield, $$value => $$invalidate(12, $shield = $$value));
    	validate_store(colors, "colors");
    	component_subscribe($$self, colors, $$value => $$invalidate(13, $colors = $$value));
    	validate_store(patterns, "patterns");
    	component_subscribe($$self, patterns, $$value => $$invalidate(14, $patterns = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MenuItem", slots, []);
    	let { coa } = $$props, { title } = $$props, { itemSize } = $$props;
    	let { ordinary, division, charges = [] } = coa;
    	if (ordinary?.ordinary === "no") ordinary = null;
    	let tDiv = division ? division.t : "";
    	let i = Math.floor(1000000 * Math.random());

    	// get color or link to pattern
    	function clr(tincture) {
    		if (coaColors[tincture]) return coaColors[tincture];
    		if (!tincture) debugger;
    		set_store_value(patterns, $patterns[$patterns.length] = tincture, $patterns);
    		return "url(#" + tincture + ")";
    	}

    	const writable_props = ["coa", "title", "itemSize"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MenuItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("coa" in $$props) $$invalidate(0, coa = $$props.coa);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("itemSize" in $$props) $$invalidate(2, itemSize = $$props.itemSize);
    	};

    	$$self.$capture_state = () => ({
    		Ordinary,
    		Charge,
    		shield,
    		colors,
    		patterns,
    		coa,
    		title,
    		itemSize,
    		ordinary,
    		division,
    		charges,
    		tDiv,
    		i,
    		getTemplate: getTemplate$2,
    		clr,
    		coaShield,
    		$shield,
    		shieldPath,
    		coaColors,
    		$colors,
    		$patterns
    	});

    	$$self.$inject_state = $$props => {
    		if ("coa" in $$props) $$invalidate(0, coa = $$props.coa);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("itemSize" in $$props) $$invalidate(2, itemSize = $$props.itemSize);
    		if ("ordinary" in $$props) $$invalidate(3, ordinary = $$props.ordinary);
    		if ("division" in $$props) $$invalidate(7, division = $$props.division);
    		if ("charges" in $$props) $$invalidate(8, charges = $$props.charges);
    		if ("tDiv" in $$props) $$invalidate(9, tDiv = $$props.tDiv);
    		if ("i" in $$props) $$invalidate(11, i = $$props.i);
    		if ("coaShield" in $$props) $$invalidate(4, coaShield = $$props.coaShield);
    		if ("shieldPath" in $$props) $$invalidate(5, shieldPath = $$props.shieldPath);
    		if ("coaColors" in $$props) $$invalidate(6, coaColors = $$props.coaColors);
    	};

    	let coaShield;
    	let shieldPath;
    	let coaColors;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*coa, $shield*/ 4097) {
    			 $$invalidate(4, coaShield = coa.shield || $shield);
    		}

    		if ($$self.$$.dirty & /*coaShield*/ 16) {
    			 $$invalidate(5, shieldPath = document.querySelector(`#defs g#shields > #${coaShield} > path`).getAttribute("d"));
    		}

    		if ($$self.$$.dirty & /*$colors*/ 8192) {
    			 $$invalidate(6, coaColors = $colors);
    		}
    	};

    	return [
    		coa,
    		title,
    		itemSize,
    		ordinary,
    		coaShield,
    		shieldPath,
    		coaColors,
    		division,
    		charges,
    		tDiv,
    		clr,
    		i
    	];
    }

    class MenuItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { coa: 0, title: 1, itemSize: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuItem",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*coa*/ ctx[0] === undefined && !("coa" in props)) {
    			console.warn("<MenuItem> was created without expected prop 'coa'");
    		}

    		if (/*title*/ ctx[1] === undefined && !("title" in props)) {
    			console.warn("<MenuItem> was created without expected prop 'title'");
    		}

    		if (/*itemSize*/ ctx[2] === undefined && !("itemSize" in props)) {
    			console.warn("<MenuItem> was created without expected prop 'itemSize'");
    		}
    	}

    	get coa() {
    		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set coa(value) {
    		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemSize() {
    		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemSize(value) {
    		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\EditorType.svelte generated by Svelte v3.29.4 */

    const file$9 = "src\\EditorType.svelte";

    function create_fragment$9(ctx) {
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
    			add_location(option0, file$9, 6, 2, 120);
    			option1.__value = "pattern";
    			option1.value = option1.__value;
    			add_location(option1, file$9, 7, 2, 166);
    			option2.__value = "semy";
    			option2.value = option2.__value;
    			add_location(option2, file$9, 8, 2, 210);
    			if (/*type*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$9, 5, 0, 65);
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
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[2]),
    					listen_dev(
    						select,
    						"input",
    						function () {
    							if (is_function(/*updateSection*/ ctx[1])) /*updateSection*/ ctx[1].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

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
    	validate_slots("EditorType", slots, []);
    	let { type } = $$props, { updateSection } = $$props;
    	const writable_props = ["type", "updateSection"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditorType> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		type = select_value(this);
    		$$invalidate(0, type);
    	}

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("updateSection" in $$props) $$invalidate(1, updateSection = $$props.updateSection);
    	};

    	$$self.$capture_state = () => ({ type, updateSection });

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("updateSection" in $$props) $$invalidate(1, updateSection = $$props.updateSection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, updateSection, select_change_handler];
    }

    class EditorType extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { type: 0, updateSection: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorType",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*type*/ ctx[0] === undefined && !("type" in props)) {
    			console.warn("<EditorType> was created without expected prop 'type'");
    		}

    		if (/*updateSection*/ ctx[1] === undefined && !("updateSection" in props)) {
    			console.warn("<EditorType> was created without expected prop 'updateSection'");
    		}
    	}

    	get type() {
    		throw new Error("<EditorType>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<EditorType>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateSection() {
    		throw new Error("<EditorType>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set updateSection(value) {
    		throw new Error("<EditorType>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\EditorSize.svelte generated by Svelte v3.29.4 */

    const file$a = "src\\EditorSize.svelte";

    function create_fragment$a(ctx) {
    	let span;
    	let t1;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Size:";
    			t1 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Big";
    			option1 = element("option");
    			option1.textContent = "Standard";
    			option2 = element("option");
    			option2.textContent = "Small";
    			option3 = element("option");
    			option3.textContent = "Smaller";
    			option4 = element("option");
    			option4.textContent = "Smallest";
    			set_style(span, "margin-left", "1em");
    			add_location(span, file$a, 4, 0, 43);
    			option0.__value = "big";
    			option0.value = option0.__value;
    			add_location(option0, file$a, 6, 2, 118);
    			option1.__value = "standard";
    			option1.value = option1.__value;
    			add_location(option1, file$a, 7, 2, 154);
    			option2.__value = "small";
    			option2.value = option2.__value;
    			add_location(option2, file$a, 8, 2, 200);
    			option3.__value = "smaller";
    			option3.value = option3.__value;
    			add_location(option3, file$a, 9, 2, 240);
    			option4.__value = "smallest";
    			option4.value = option4.__value;
    			add_location(option4, file$a, 10, 2, 284);
    			if (/*size*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[1].call(select));
    			add_location(select, file$a, 5, 0, 88);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("EditorSize", slots, []);
    	let { size } = $$props;
    	const writable_props = ["size"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditorSize> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		size = select_value(this);
    		$$invalidate(0, size);
    	}

    	$$self.$$set = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ size });

    	$$self.$inject_state = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, select_change_handler];
    }

    class EditorSize extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { size: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorSize",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*size*/ ctx[0] === undefined && !("size" in props)) {
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

    /* src\EditorTincture.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$1 } = globals;
    const file$b = "src\\EditorTincture.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (9:0) {#each tinctures as coa}
    function create_each_block$5(ctx) {
    	let div;
    	let menuitem;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	menuitem = new MenuItem({
    			props: {
    				coa: /*coa*/ ctx[5],
    				title: /*cap*/ ctx[3](/*coa*/ ctx[5].t1),
    				itemSize: /*itemSize*/ ctx[1]
    			},
    			$$inline: true
    		});

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[4](/*coa*/ ctx[5], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(menuitem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*t1*/ ctx[0] === /*coa*/ ctx[5].t1);
    			add_location(div, file$b, 9, 2, 336);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menuitem, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const menuitem_changes = {};
    			if (dirty & /*itemSize*/ 2) menuitem_changes.itemSize = /*itemSize*/ ctx[1];
    			menuitem.$set(menuitem_changes);

    			if (dirty & /*t1, tinctures*/ 5) {
    				toggle_class(div, "selected", /*t1*/ ctx[0] === /*coa*/ ctx[5].t1);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menuitem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(9:0) {#each tinctures as coa}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let t1_1;
    	let each_1_anchor;
    	let current;
    	let each_value = /*tinctures*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
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
    			add_location(div, file$b, 7, 0, 286);
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
    			if (dirty & /*t1, tinctures, cap, itemSize*/ 15) {
    				each_value = /*tinctures*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("EditorTincture", slots, []);
    	let { t1 } = $$props, { itemSize } = $$props;
    	const tinctures = ["argent", "or", "gules", "sable", "azure", "vert", "purpure"].map(t => new Object({ t1: t }));
    	const cap = string => string.charAt(0).toUpperCase() + string.slice(1);
    	const writable_props = ["t1", "itemSize"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditorTincture> was created with unknown prop '${key}'`);
    	});

    	const click_handler = coa => $$invalidate(0, t1 = coa.t1);

    	$$self.$$set = $$props => {
    		if ("t1" in $$props) $$invalidate(0, t1 = $$props.t1);
    		if ("itemSize" in $$props) $$invalidate(1, itemSize = $$props.itemSize);
    	};

    	$$self.$capture_state = () => ({ MenuItem, t1, itemSize, tinctures, cap });

    	$$self.$inject_state = $$props => {
    		if ("t1" in $$props) $$invalidate(0, t1 = $$props.t1);
    		if ("itemSize" in $$props) $$invalidate(1, itemSize = $$props.itemSize);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [t1, itemSize, tinctures, cap, click_handler];
    }

    class EditorTincture extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { t1: 0, itemSize: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorTincture",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*t1*/ ctx[0] === undefined && !("t1" in props)) {
    			console.warn("<EditorTincture> was created without expected prop 't1'");
    		}

    		if (/*itemSize*/ ctx[1] === undefined && !("itemSize" in props)) {
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

    /* src\Switch.svelte generated by Svelte v3.29.4 */

    const file$c = "src\\Switch.svelte";

    function create_fragment$c(ctx) {
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
    			attr_dev(input, "class", "switch-input svelte-1fvg7o3");
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$c, 6, 2, 134);
    			attr_dev(label, "for", /*id*/ ctx[1]);
    			attr_dev(label, "class", "switch-label svelte-1fvg7o3");
    			add_location(label, file$c, 7, 2, 200);
    			attr_dev(div, "class", "switch svelte-1fvg7o3");
    			add_location(div, file$c, 5, 0, 112);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Switch", slots, []);
    	let { checked = false } = $$props;
    	const id = "switch" + Math.floor(1000000 * Math.random());
    	const writable_props = ["checked"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => ({ checked, id });

    	$$self.$inject_state = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked, id, input_change_handler];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { checked: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get checked() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Editor.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$2, console: console_1$1 } = globals;

    const file$d = "src\\Editor.svelte";

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[71] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[76] = list[i];
    	return child_ctx;
    }

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[68] = list[i];
    	child_ctx[69] = list;
    	child_ctx[70] = i;
    	return child_ctx;
    }

    function get_each_context_4$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[76] = list[i];
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_10(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_11(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_12(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[76] = list[i];
    	return child_ctx;
    }

    function get_each_context_13(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (250:2) {#key coa}
    function create_key_block(ctx) {
    	let coa_1;
    	let current;

    	coa_1 = new COA({
    			props: {
    				coa: /*coa*/ ctx[0],
    				i: "Edit",
    				w: /*coaSize*/ ctx[4],
    				h: /*coaSize*/ ctx[4]
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
    			if (dirty[0] & /*coa*/ 1) coa_1_changes.coa = /*coa*/ ctx[0];
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
    		id: create_key_block.name,
    		type: "key",
    		source: "(250:2) {#key coa}",
    		ctx
    	});

    	return block;
    }

    // (259:8) {#if menu.field.type !== "tincture"}
    function create_if_block_14$1(ctx) {
    	let editorsize;
    	let updating_size;
    	let current;

    	function editorsize_size_binding(value) {
    		/*editorsize_size_binding*/ ctx[16].call(null, value);
    	}

    	let editorsize_props = {};

    	if (/*menu*/ ctx[1].field.size !== void 0) {
    		editorsize_props.size = /*menu*/ ctx[1].field.size;
    	}

    	editorsize = new EditorSize({ props: editorsize_props, $$inline: true });
    	binding_callbacks.push(() => bind(editorsize, "size", editorsize_size_binding));

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

    			if (!updating_size && dirty[0] & /*menu*/ 2) {
    				updating_size = true;
    				editorsize_changes.size = /*menu*/ ctx[1].field.size;
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
    		id: create_if_block_14$1.name,
    		type: "if",
    		source: "(259:8) {#if menu.field.type !== \\\"tincture\\\"}",
    		ctx
    	});

    	return block;
    }

    // (268:6) {#if menu.field.type !== "tincture"}
    function create_if_block_13$2(ctx) {
    	let div;
    	let editortincture;
    	let updating_t1;
    	let current;

    	function editortincture_t1_binding_1(value) {
    		/*editortincture_t1_binding_1*/ ctx[18].call(null, value);
    	}

    	let editortincture_props = { itemSize: /*itemSize*/ ctx[7] };

    	if (/*menu*/ ctx[1].field.t2 !== void 0) {
    		editortincture_props.t1 = /*menu*/ ctx[1].field.t2;
    	}

    	editortincture = new EditorTincture({
    			props: editortincture_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editortincture, "t1", editortincture_t1_binding_1));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editortincture.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-5f4r5t");
    			add_location(div, file$d, 268, 8, 9338);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editortincture, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editortincture_changes = {};

    			if (!updating_t1 && dirty[0] & /*menu*/ 2) {
    				updating_t1 = true;
    				editortincture_changes.t1 = /*menu*/ ctx[1].field.t2;
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
    		id: create_if_block_13$2.name,
    		type: "if",
    		source: "(268:6) {#if menu.field.type !== \\\"tincture\\\"}",
    		ctx
    	});

    	return block;
    }

    // (274:6) {#if menu.field.type === "pattern"}
    function create_if_block_12$2(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let current;
    	let each_value_13 = /*patterns*/ ctx[8].map(/*func*/ ctx[19]);
    	validate_each_argument(each_value_13);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_13.length; i += 1) {
    		each_blocks[i] = create_each_block_13(get_each_context_13(ctx, each_value_13, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Pattern:";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div0, file$d, 275, 10, 9546);
    			attr_dev(div1, "class", "subsection svelte-5f4r5t");
    			add_location(div1, file$d, 274, 8, 9510);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*menu, patterns, itemSize*/ 386) {
    				each_value_13 = /*patterns*/ ctx[8].map(/*func*/ ctx[19]);
    				validate_each_argument(each_value_13);
    				let i;

    				for (i = 0; i < each_value_13.length; i += 1) {
    					const child_ctx = get_each_context_13(ctx, each_value_13, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_13(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_13.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_13.length; i += 1) {
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
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$2.name,
    		type: "if",
    		source: "(274:6) {#if menu.field.type === \\\"pattern\\\"}",
    		ctx
    	});

    	return block;
    }

    // (277:10) {#each patterns.map(p => new Object({t1: `${p}-${menu.field.t1}-${menu.field.t2}-${menu.field.size}`, pattern: p})) as coa}
    function create_each_block_13(ctx) {
    	let div;
    	let menuitem;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	menuitem = new MenuItem({
    			props: {
    				coa: /*coa*/ ctx[0],
    				title: cap(/*coa*/ ctx[0].pattern),
    				itemSize: /*itemSize*/ ctx[7]
    			},
    			$$inline: true
    		});

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[20](/*coa*/ ctx[0], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(menuitem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*menu*/ ctx[1].field.pattern === /*coa*/ ctx[0].pattern);
    			add_location(div, file$d, 277, 12, 9714);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menuitem, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const menuitem_changes = {};
    			if (dirty[0] & /*menu*/ 2) menuitem_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*menu*/ 2) menuitem_changes.title = cap(/*coa*/ ctx[0].pattern);
    			menuitem.$set(menuitem_changes);

    			if (dirty[0] & /*menu, patterns*/ 258) {
    				toggle_class(div, "selected", /*menu*/ ctx[1].field.pattern === /*coa*/ ctx[0].pattern);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menuitem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_13.name,
    		type: "each",
    		source: "(277:10) {#each patterns.map(p => new Object({t1: `${p}-${menu.field.t1}-${menu.field.t2}-${menu.field.size}`, pattern: p})) as coa}",
    		ctx
    	});

    	return block;
    }

    // (285:6) {#if menu.field.type === "semy"}
    function create_if_block_11$2(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let select;
    	let t1;
    	let t2_value = console.log(/*menu*/ ctx[1].field.semy, /*menu*/ ctx[1], /*coa*/ ctx[0]) + "";
    	let t2;
    	let t3;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_12 = /*chargeTypes*/ ctx[9];
    	validate_each_argument(each_value_12);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_12.length; i += 1) {
    		each_blocks_1[i] = create_each_block_12(get_each_context_12(ctx, each_value_12, i));
    	}

    	let each_value_11 = Object.keys(charges[/*menu*/ ctx[1].field.semy]).map(/*func_1*/ ctx[22]);
    	validate_each_argument(each_value_11);
    	const get_key = ctx => /*coa*/ ctx[0];
    	validate_each_keys(ctx, each_value_11, get_each_context_11, get_key);

    	for (let i = 0; i < each_value_11.length; i += 1) {
    		let child_ctx = get_each_context_11(ctx, each_value_11, i);
    		let key = get_key(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block_11(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text("Charge:\r\n            ");
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "svelte-5f4r5t");
    			if (/*menu*/ ctx[1].field.semy === void 0) add_render_callback(() => /*select_change_handler*/ ctx[21].call(select));
    			add_location(select, file$d, 287, 12, 10083);
    			add_location(div0, file$d, 286, 10, 10057);
    			attr_dev(div1, "class", "subsection svelte-5f4r5t");
    			add_location(div1, file$d, 285, 8, 10021);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div0, select);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*menu*/ ctx[1].field.semy);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[21]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*chargeTypes*/ 512) {
    				each_value_12 = /*chargeTypes*/ ctx[9];
    				validate_each_argument(each_value_12);
    				let i;

    				for (i = 0; i < each_value_12.length; i += 1) {
    					const child_ctx = get_each_context_12(ctx, each_value_12, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_12(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_12.length;
    			}

    			if (dirty[0] & /*menu, chargeTypes*/ 514) {
    				select_option(select, /*menu*/ ctx[1].field.semy);
    			}

    			if ((!current || dirty[0] & /*menu, coa*/ 3) && t2_value !== (t2_value = console.log(/*menu*/ ctx[1].field.semy, /*menu*/ ctx[1], /*coa*/ ctx[0]) + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*menu, itemSize*/ 130) {
    				const each_value_11 = Object.keys(charges[/*menu*/ ctx[1].field.semy]).map(/*func_1*/ ctx[22]);
    				validate_each_argument(each_value_11);
    				group_outros();
    				validate_each_keys(ctx, each_value_11, get_each_context_11, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_11, each1_lookup, div1, outro_and_destroy_block, create_each_block_11, null, get_each_context_11);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_11.length; i += 1) {
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
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$2.name,
    		type: "if",
    		source: "(285:6) {#if menu.field.type === \\\"semy\\\"}",
    		ctx
    	});

    	return block;
    }

    // (289:14) {#each chargeTypes as type}
    function create_each_block_12(ctx) {
    	let option;
    	let t_value = cap(/*type*/ ctx[76]) + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*type*/ ctx[76];
    			option.value = option.__value;
    			add_location(option, file$d, 289, 16, 10181);
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
    		id: create_each_block_12.name,
    		type: "each",
    		source: "(289:14) {#each chargeTypes as type}",
    		ctx
    	});

    	return block;
    }

    // (296:10) {#each Object.keys(charges[menu.field.semy]).map(c => new Object({t1: `semy_of_${c}-${menu.field.t1}-${menu.field.t2}-${menu.field.size}`, charge: c})) as coa (coa)}
    function create_each_block_11(key_1, ctx) {
    	let div;
    	let menuitem;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	menuitem = new MenuItem({
    			props: {
    				coa: /*coa*/ ctx[0],
    				title: cap(/*coa*/ ctx[0].charge),
    				itemSize: /*itemSize*/ ctx[7]
    			},
    			$$inline: true
    		});

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[23](/*coa*/ ctx[0], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(menuitem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*menu*/ ctx[1].field.charge === /*coa*/ ctx[0].charge);
    			add_location(div, file$d, 296, 12, 10532);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menuitem, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const menuitem_changes = {};
    			if (dirty[0] & /*menu*/ 2) menuitem_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*menu*/ 2) menuitem_changes.title = cap(/*coa*/ ctx[0].charge);
    			menuitem.$set(menuitem_changes);

    			if (dirty[0] & /*menu*/ 2) {
    				toggle_class(div, "selected", /*menu*/ ctx[1].field.charge === /*coa*/ ctx[0].charge);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menuitem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_11.name,
    		type: "each",
    		source: "(296:10) {#each Object.keys(charges[menu.field.semy]).map(c => new Object({t1: `semy_of_${c}-${menu.field.t1}-${menu.field.t2}-${menu.field.size}`, charge: c})) as coa (coa)}",
    		ctx
    	});

    	return block;
    }

    // (309:8) {#each ["no"].concat(Object.keys(divisions.variants)).map(division => new Object({t1: coa.t1, division: {division, t: coa.division ? coa.division.t : menu.division.t1, line: menu.division.line}})) as coa (coa)}
    function create_each_block_10(key_1, ctx) {
    	let div;
    	let menuitem;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	menuitem = new MenuItem({
    			props: {
    				coa: /*coa*/ ctx[0],
    				title: cap(/*coa*/ ctx[0].division.division),
    				itemSize: /*itemSize*/ ctx[7]
    			},
    			$$inline: true
    		});

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[25](/*coa*/ ctx[0], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(menuitem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*menu*/ ctx[1].division.division === /*coa*/ ctx[0].division.division);
    			add_location(div, file$d, 309, 10, 11197);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menuitem, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const menuitem_changes = {};
    			if (dirty[0] & /*coa, menu*/ 3) menuitem_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*coa, menu*/ 3) menuitem_changes.title = cap(/*coa*/ ctx[0].division.division);
    			menuitem.$set(menuitem_changes);

    			if (dirty[0] & /*menu, coa*/ 3) {
    				toggle_class(div, "selected", /*menu*/ ctx[1].division.division === /*coa*/ ctx[0].division.division);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menuitem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_10.name,
    		type: "each",
    		source: "(309:8) {#each [\\\"no\\\"].concat(Object.keys(divisions.variants)).map(division => new Object({t1: coa.t1, division: {division, t: coa.division ? coa.division.t : menu.division.t1, line: menu.division.line}})) as coa (coa)}",
    		ctx
    	});

    	return block;
    }

    // (316:6) {#if divisions[coa.division?.division]}
    function create_if_block_10$2(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value_9 = Object.keys(lines).map(/*func_3*/ ctx[26]);
    	validate_each_argument(each_value_9);
    	const get_key = ctx => /*coa*/ ctx[0];
    	validate_each_keys(ctx, each_value_9, get_each_context_9, get_key);

    	for (let i = 0; i < each_value_9.length; i += 1) {
    		let child_ctx = get_each_context_9(ctx, each_value_9, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_9(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Line:";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div0, file$d, 317, 10, 11564);
    			attr_dev(div1, "class", "subsection svelte-5f4r5t");
    			add_location(div1, file$d, 316, 8, 11528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*menu, coa, itemSize*/ 131) {
    				const each_value_9 = Object.keys(lines).map(/*func_3*/ ctx[26]);
    				validate_each_argument(each_value_9);
    				group_outros();
    				validate_each_keys(ctx, each_value_9, get_each_context_9, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_9, each_1_lookup, div1, outro_and_destroy_block, create_each_block_9, null, get_each_context_9);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_9.length; i += 1) {
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
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$2.name,
    		type: "if",
    		source: "(316:6) {#if divisions[coa.division?.division]}",
    		ctx
    	});

    	return block;
    }

    // (319:10) {#each Object.keys(lines).map(line => new Object({t1: coa.t1, division: {division: menu.division.division, t: coa.division ? coa.division.t : menu.division.t1, line}})) as coa (coa)}
    function create_each_block_9(key_1, ctx) {
    	let div;
    	let menuitem;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	menuitem = new MenuItem({
    			props: {
    				coa: /*coa*/ ctx[0],
    				title: cap(/*coa*/ ctx[0].division.line),
    				itemSize: /*itemSize*/ ctx[7]
    			},
    			$$inline: true
    		});

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[27](/*coa*/ ctx[0], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(menuitem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*menu*/ ctx[1].division.line === /*coa*/ ctx[0].division.line);
    			add_location(div, file$d, 319, 12, 11788);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menuitem, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const menuitem_changes = {};
    			if (dirty[0] & /*coa, menu*/ 3) menuitem_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*coa, menu*/ 3) menuitem_changes.title = cap(/*coa*/ ctx[0].division.line);
    			menuitem.$set(menuitem_changes);

    			if (dirty[0] & /*menu, coa*/ 3) {
    				toggle_class(div, "selected", /*menu*/ ctx[1].division.line === /*coa*/ ctx[0].division.line);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menuitem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_9.name,
    		type: "each",
    		source: "(319:10) {#each Object.keys(lines).map(line => new Object({t1: coa.t1, division: {division: menu.division.division, t: coa.division ? coa.division.t : menu.division.t1, line}})) as coa (coa)}",
    		ctx
    	});

    	return block;
    }

    // (327:6) {#if coa.division}
    function create_if_block_5$3(ctx) {
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
    		/*editortype_type_binding_1*/ ctx[28].call(null, value);
    	}

    	let editortype_props = { updateSection };

    	if (/*menu*/ ctx[1].division.type !== void 0) {
    		editortype_props.type = /*menu*/ ctx[1].division.type;
    	}

    	editortype = new EditorType({ props: editortype_props, $$inline: true });
    	binding_callbacks.push(() => bind(editortype, "type", editortype_type_binding_1));
    	let if_block0 = /*menu*/ ctx[1].division.type !== "tincture" && create_if_block_9$2(ctx);

    	function editortincture_t1_binding_2(value) {
    		/*editortincture_t1_binding_2*/ ctx[30].call(null, value);
    	}

    	let editortincture_props = { itemSize: /*itemSize*/ ctx[7] };

    	if (/*menu*/ ctx[1].division.t1 !== void 0) {
    		editortincture_props.t1 = /*menu*/ ctx[1].division.t1;
    	}

    	editortincture = new EditorTincture({
    			props: editortincture_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editortincture, "t1", editortincture_t1_binding_2));
    	let if_block1 = /*menu*/ ctx[1].division.type !== "tincture" && create_if_block_8$2(ctx);
    	let if_block2 = /*menu*/ ctx[1].division.type === "pattern" && create_if_block_7$3(ctx);
    	let if_block3 = /*menu*/ ctx[1].division.type === "semy" && create_if_block_6$3(ctx);

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
    			attr_dev(div0, "class", "subsection svelte-5f4r5t");
    			add_location(div0, file$d, 327, 8, 12099);
    			attr_dev(div1, "class", "subsection svelte-5f4r5t");
    			add_location(div1, file$d, 334, 8, 12349);
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

    			if (!updating_type && dirty[0] & /*menu*/ 2) {
    				updating_type = true;
    				editortype_changes.type = /*menu*/ ctx[1].division.type;
    				add_flush_callback(() => updating_type = false);
    			}

    			editortype.$set(editortype_changes);

    			if (/*menu*/ ctx[1].division.type !== "tincture") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_9$2(ctx);
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

    			if (!updating_t1 && dirty[0] & /*menu*/ 2) {
    				updating_t1 = true;
    				editortincture_changes.t1 = /*menu*/ ctx[1].division.t1;
    				add_flush_callback(() => updating_t1 = false);
    			}

    			editortincture.$set(editortincture_changes);

    			if (/*menu*/ ctx[1].division.type !== "tincture") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_8$2(ctx);
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

    			if (/*menu*/ ctx[1].division.type === "pattern") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_7$3(ctx);
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

    			if (/*menu*/ ctx[1].division.type === "semy") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 2) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_6$3(ctx);
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
    		id: create_if_block_5$3.name,
    		type: "if",
    		source: "(327:6) {#if coa.division}",
    		ctx
    	});

    	return block;
    }

    // (330:10) {#if menu.division.type !== "tincture"}
    function create_if_block_9$2(ctx) {
    	let editorsize;
    	let updating_size;
    	let current;

    	function editorsize_size_binding_1(value) {
    		/*editorsize_size_binding_1*/ ctx[29].call(null, value);
    	}

    	let editorsize_props = {};

    	if (/*menu*/ ctx[1].division.size !== void 0) {
    		editorsize_props.size = /*menu*/ ctx[1].division.size;
    	}

    	editorsize = new EditorSize({ props: editorsize_props, $$inline: true });
    	binding_callbacks.push(() => bind(editorsize, "size", editorsize_size_binding_1));

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

    			if (!updating_size && dirty[0] & /*menu*/ 2) {
    				updating_size = true;
    				editorsize_changes.size = /*menu*/ ctx[1].division.size;
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
    		id: create_if_block_9$2.name,
    		type: "if",
    		source: "(330:10) {#if menu.division.type !== \\\"tincture\\\"}",
    		ctx
    	});

    	return block;
    }

    // (339:8) {#if menu.division.type !== "tincture"}
    function create_if_block_8$2(ctx) {
    	let div;
    	let editortincture;
    	let updating_t1;
    	let current;

    	function editortincture_t1_binding_3(value) {
    		/*editortincture_t1_binding_3*/ ctx[31].call(null, value);
    	}

    	let editortincture_props = { itemSize: /*itemSize*/ ctx[7] };

    	if (/*menu*/ ctx[1].division.t2 !== void 0) {
    		editortincture_props.t1 = /*menu*/ ctx[1].division.t2;
    	}

    	editortincture = new EditorTincture({
    			props: editortincture_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editortincture, "t1", editortincture_t1_binding_3));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editortincture.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-5f4r5t");
    			add_location(div, file$d, 339, 10, 12519);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editortincture, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editortincture_changes = {};

    			if (!updating_t1 && dirty[0] & /*menu*/ 2) {
    				updating_t1 = true;
    				editortincture_changes.t1 = /*menu*/ ctx[1].division.t2;
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
    		id: create_if_block_8$2.name,
    		type: "if",
    		source: "(339:8) {#if menu.division.type !== \\\"tincture\\\"}",
    		ctx
    	});

    	return block;
    }

    // (345:8) {#if menu.division.type === "pattern"}
    function create_if_block_7$3(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let current;
    	let each_value_8 = /*patterns*/ ctx[8].map(/*func_4*/ ctx[32]);
    	validate_each_argument(each_value_8);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Pattern:";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div0, file$d, 346, 12, 12745);
    			attr_dev(div1, "class", "subsection svelte-5f4r5t");
    			add_location(div1, file$d, 345, 10, 12707);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*menu, patterns, itemSize*/ 386) {
    				each_value_8 = /*patterns*/ ctx[8].map(/*func_4*/ ctx[32]);
    				validate_each_argument(each_value_8);
    				let i;

    				for (i = 0; i < each_value_8.length; i += 1) {
    					const child_ctx = get_each_context_8(ctx, each_value_8, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_8(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_8.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_8.length; i += 1) {
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
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$3.name,
    		type: "if",
    		source: "(345:8) {#if menu.division.type === \\\"pattern\\\"}",
    		ctx
    	});

    	return block;
    }

    // (348:12) {#each patterns.map(p => new Object({t1: `${p}-${menu.division.t1}-${menu.division.t2}-${menu.division.size}`, pattern: p})) as coa}
    function create_each_block_8(ctx) {
    	let div;
    	let menuitem;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	menuitem = new MenuItem({
    			props: {
    				coa: /*coa*/ ctx[0],
    				title: cap(/*coa*/ ctx[0].pattern),
    				itemSize: /*itemSize*/ ctx[7]
    			},
    			$$inline: true
    		});

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[33](/*coa*/ ctx[0], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(menuitem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*menu*/ ctx[1].division.pattern === /*coa*/ ctx[0].pattern);
    			add_location(div, file$d, 348, 14, 12926);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menuitem, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_4, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const menuitem_changes = {};
    			if (dirty[0] & /*menu*/ 2) menuitem_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*menu*/ 2) menuitem_changes.title = cap(/*coa*/ ctx[0].pattern);
    			menuitem.$set(menuitem_changes);

    			if (dirty[0] & /*menu, patterns*/ 258) {
    				toggle_class(div, "selected", /*menu*/ ctx[1].division.pattern === /*coa*/ ctx[0].pattern);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menuitem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(348:12) {#each patterns.map(p => new Object({t1: `${p}-${menu.division.t1}-${menu.division.t2}-${menu.division.size}`, pattern: p})) as coa}",
    		ctx
    	});

    	return block;
    }

    // (356:8) {#if menu.division.type === "semy"}
    function create_if_block_6$3(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let select;
    	let t1;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_7 = /*chargeTypes*/ ctx[9];
    	validate_each_argument(each_value_7);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks_1[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	let each_value_6 = Object.keys(charges[/*menu*/ ctx[1].division.semy]).map(/*func_5*/ ctx[35]);
    	validate_each_argument(each_value_6);
    	const get_key = ctx => /*coa*/ ctx[0];
    	validate_each_keys(ctx, each_value_6, get_each_context_6, get_key);

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		let child_ctx = get_each_context_6(ctx, each_value_6, i);
    		let key = get_key(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block_6(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text("Charge:\r\n              ");
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "svelte-5f4r5t");
    			if (/*menu*/ ctx[1].division.semy === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[34].call(select));
    			add_location(select, file$d, 358, 14, 13322);
    			add_location(div0, file$d, 357, 12, 13294);
    			attr_dev(div1, "class", "subsection svelte-5f4r5t");
    			add_location(div1, file$d, 356, 10, 13256);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div0, select);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*menu*/ ctx[1].division.semy);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_1*/ ctx[34]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*chargeTypes*/ 512) {
    				each_value_7 = /*chargeTypes*/ ctx[9];
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_7(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_7.length;
    			}

    			if (dirty[0] & /*menu, chargeTypes*/ 514) {
    				select_option(select, /*menu*/ ctx[1].division.semy);
    			}

    			if (dirty[0] & /*menu, itemSize*/ 130) {
    				const each_value_6 = Object.keys(charges[/*menu*/ ctx[1].division.semy]).map(/*func_5*/ ctx[35]);
    				validate_each_argument(each_value_6);
    				group_outros();
    				validate_each_keys(ctx, each_value_6, get_each_context_6, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_6, each1_lookup, div1, outro_and_destroy_block, create_each_block_6, null, get_each_context_6);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_6.length; i += 1) {
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
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$3.name,
    		type: "if",
    		source: "(356:8) {#if menu.division.type === \\\"semy\\\"}",
    		ctx
    	});

    	return block;
    }

    // (360:16) {#each chargeTypes as type}
    function create_each_block_7(ctx) {
    	let option;
    	let t_value = cap(/*type*/ ctx[76]) + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*type*/ ctx[76];
    			option.value = option.__value;
    			add_location(option, file$d, 360, 18, 13427);
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
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(360:16) {#each chargeTypes as type}",
    		ctx
    	});

    	return block;
    }

    // (366:12) {#each Object.keys(charges[menu.division.semy]).map(c => new Object({t1: `semy_of_${c}-${menu.division.t1}-${menu.division.t2}-${menu.division.size}`, charge: c})) as coa (coa)}
    function create_each_block_6(key_1, ctx) {
    	let div;
    	let menuitem;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	menuitem = new MenuItem({
    			props: {
    				coa: /*coa*/ ctx[0],
    				title: cap(/*coa*/ ctx[0].charge),
    				itemSize: /*itemSize*/ ctx[7]
    			},
    			$$inline: true
    		});

    	function click_handler_5(...args) {
    		return /*click_handler_5*/ ctx[36](/*coa*/ ctx[0], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(menuitem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*menu*/ ctx[1].division.charge === /*coa*/ ctx[0].charge);
    			add_location(div, file$d, 366, 14, 13747);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menuitem, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_5, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const menuitem_changes = {};
    			if (dirty[0] & /*menu*/ 2) menuitem_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*menu*/ 2) menuitem_changes.title = cap(/*coa*/ ctx[0].charge);
    			menuitem.$set(menuitem_changes);

    			if (dirty[0] & /*menu*/ 2) {
    				toggle_class(div, "selected", /*menu*/ ctx[1].division.charge === /*coa*/ ctx[0].charge);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menuitem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(366:12) {#each Object.keys(charges[menu.division.semy]).map(c => new Object({t1: `semy_of_${c}-${menu.division.t1}-${menu.division.t2}-${menu.division.size}`, charge: c})) as coa (coa)}",
    		ctx
    	});

    	return block;
    }

    // (379:6) {#if coa.division}
    function create_if_block_4$3(ctx) {
    	let div;
    	let t0;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Divided:\r\n          ");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "No (standard)";
    			option1 = element("option");
    			option1.textContent = "Crop by main field";
    			option2 = element("option");
    			option2.textContent = "Crop by division";
    			option3 = element("option");
    			option3.textContent = "Сountercharged";
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$d, 382, 12, 14326);
    			option1.__value = "field";
    			option1.value = option1.__value;
    			add_location(option1, file$d, 383, 12, 14379);
    			option2.__value = "division";
    			option2.value = option2.__value;
    			add_location(option2, file$d, 384, 12, 14440);
    			option3.__value = "counter";
    			option3.value = option3.__value;
    			add_location(option3, file$d, 385, 12, 14502);
    			attr_dev(select, "class", "svelte-5f4r5t");
    			if (/*menu*/ ctx[1].ordinary.divided === void 0) add_render_callback(() => /*select_change_handler_2*/ ctx[37].call(select));
    			add_location(select, file$d, 381, 10, 14269);
    			attr_dev(div, "class", "subsection svelte-5f4r5t");
    			add_location(div, file$d, 379, 8, 14188);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			select_option(select, /*menu*/ ctx[1].ordinary.divided);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler_2*/ ctx[37]),
    					listen_dev(div, "click", updateSection, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*menu, chargeTypes*/ 514) {
    				select_option(select, /*menu*/ ctx[1].ordinary.divided);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$3.name,
    		type: "if",
    		source: "(379:6) {#if coa.division}",
    		ctx
    	});

    	return block;
    }

    // (392:8) {#each ordinariesList.map(ordinary => new Object({t1: coa.t1, division: coa.division, ordinary: {ordinary, line: menu.ordinary.line, t: menu.ordinary.t, divided: menu.ordinary.divided}})) as coa (coa)}
    function create_each_block_5(key_1, ctx) {
    	let div;
    	let menuitem;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	menuitem = new MenuItem({
    			props: {
    				coa: /*coa*/ ctx[0],
    				title: cap(/*coa*/ ctx[0].ordinary.ordinary),
    				itemSize: /*itemSize*/ ctx[7]
    			},
    			$$inline: true
    		});

    	function click_handler_6(...args) {
    		return /*click_handler_6*/ ctx[39](/*coa*/ ctx[0], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(menuitem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*menu*/ ctx[1].ordinary.ordinary === /*coa*/ ctx[0].ordinary.ordinary);
    			add_location(div, file$d, 392, 10, 14879);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menuitem, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_6, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const menuitem_changes = {};
    			if (dirty[0] & /*coa, menu*/ 3) menuitem_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*coa, menu*/ 3) menuitem_changes.title = cap(/*coa*/ ctx[0].ordinary.ordinary);
    			menuitem.$set(menuitem_changes);

    			if (dirty[0] & /*menu, ordinariesList, coa*/ 1027) {
    				toggle_class(div, "selected", /*menu*/ ctx[1].ordinary.ordinary === /*coa*/ ctx[0].ordinary.ordinary);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menuitem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(392:8) {#each ordinariesList.map(ordinary => new Object({t1: coa.t1, division: coa.division, ordinary: {ordinary, line: menu.ordinary.line, t: menu.ordinary.t, divided: menu.ordinary.divided}})) as coa (coa)}",
    		ctx
    	});

    	return block;
    }

    // (399:6) {#if ordinaries.lined[menu.ordinary.ordinary]}
    function create_if_block_3$3(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value_4 = Object.keys(lines).map(/*func_7*/ ctx[40]);
    	validate_each_argument(each_value_4);
    	const get_key = ctx => /*coa*/ ctx[0];
    	validate_each_keys(ctx, each_value_4, get_each_context_4$1, get_key);

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		let child_ctx = get_each_context_4$1(ctx, each_value_4, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_4$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Line:";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div0, file$d, 400, 10, 15257);
    			attr_dev(div1, "class", "subsection svelte-5f4r5t");
    			add_location(div1, file$d, 399, 8, 15221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*menu, coa, itemSize*/ 131) {
    				const each_value_4 = Object.keys(lines).map(/*func_7*/ ctx[40]);
    				validate_each_argument(each_value_4);
    				group_outros();
    				validate_each_keys(ctx, each_value_4, get_each_context_4$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_4, each_1_lookup, div1, outro_and_destroy_block, create_each_block_4$1, null, get_each_context_4$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_4.length; i += 1) {
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
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(399:6) {#if ordinaries.lined[menu.ordinary.ordinary]}",
    		ctx
    	});

    	return block;
    }

    // (402:10) {#each Object.keys(lines).map(line => new Object({t1: coa.t1, division: coa.division, ordinary: {ordinary: menu.ordinary.ordinary, line, t: menu.ordinary.t, divided: menu.ordinary.divided}})) as coa (coa)}
    function create_each_block_4$1(key_1, ctx) {
    	let div;
    	let menuitem;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	menuitem = new MenuItem({
    			props: {
    				coa: /*coa*/ ctx[0],
    				title: cap(/*coa*/ ctx[0].ordinary.line),
    				itemSize: /*itemSize*/ ctx[7]
    			},
    			$$inline: true
    		});

    	function click_handler_7(...args) {
    		return /*click_handler_7*/ ctx[41](/*coa*/ ctx[0], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(menuitem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*menu*/ ctx[1].ordinary.line === /*coa*/ ctx[0].ordinary.line);
    			add_location(div, file$d, 402, 12, 15504);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menuitem, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_7, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const menuitem_changes = {};
    			if (dirty[0] & /*coa, menu*/ 3) menuitem_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*coa, menu*/ 3) menuitem_changes.title = cap(/*coa*/ ctx[0].ordinary.line);
    			menuitem.$set(menuitem_changes);

    			if (dirty[0] & /*menu, coa*/ 3) {
    				toggle_class(div, "selected", /*menu*/ ctx[1].ordinary.line === /*coa*/ ctx[0].ordinary.line);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menuitem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4$1.name,
    		type: "each",
    		source: "(402:10) {#each Object.keys(lines).map(line => new Object({t1: coa.t1, division: coa.division, ordinary: {ordinary: menu.ordinary.ordinary, line, t: menu.ordinary.t, divided: menu.ordinary.divided}})) as coa (coa)}",
    		ctx
    	});

    	return block;
    }

    // (410:6) {#if coa.ordinary && menu.ordinary.divided !== "counter"}
    function create_if_block_2$3(ctx) {
    	let div;
    	let editortincture;
    	let updating_t1;
    	let current;

    	function editortincture_t1_binding_4(value) {
    		/*editortincture_t1_binding_4*/ ctx[42].call(null, value);
    	}

    	let editortincture_props = { itemSize: /*itemSize*/ ctx[7] };

    	if (/*menu*/ ctx[1].ordinary.t !== void 0) {
    		editortincture_props.t1 = /*menu*/ ctx[1].ordinary.t;
    	}

    	editortincture = new EditorTincture({
    			props: editortincture_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editortincture, "t1", editortincture_t1_binding_4));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editortincture.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-5f4r5t");
    			add_location(div, file$d, 410, 8, 15854);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editortincture, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editortincture_changes = {};

    			if (!updating_t1 && dirty[0] & /*menu*/ 2) {
    				updating_t1 = true;
    				editortincture_changes.t1 = /*menu*/ ctx[1].ordinary.t;
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
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(410:6) {#if coa.ordinary && menu.ordinary.divided !== \\\"counter\\\"}",
    		ctx
    	});

    	return block;
    }

    // (425:14) {#each chargeTypes as type}
    function create_each_block_3$1(ctx) {
    	let option;
    	let t_value = cap(/*type*/ ctx[76]) + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*type*/ ctx[76];
    			option.value = option.__value;
    			add_location(option, file$d, 425, 16, 16380);
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
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(425:14) {#each chargeTypes as type}",
    		ctx
    	});

    	return block;
    }

    // (430:12) {#if coa.division}
    function create_if_block_1$4(ctx) {
    	let span;
    	let t1;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let mounted;
    	let dispose;

    	function select_change_handler_3() {
    		/*select_change_handler_3*/ ctx[44].call(select, /*each_value*/ ctx[69], /*i*/ ctx[70]);
    	}

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
    			option3 = element("option");
    			option3.textContent = "Сountercharged";
    			set_style(span, "margin-left", "1em");
    			add_location(span, file$d, 430, 14, 16517);
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$d, 432, 16, 16631);
    			option1.__value = "field";
    			option1.value = option1.__value;
    			add_location(option1, file$d, 433, 16, 16688);
    			option2.__value = "division";
    			option2.value = option2.__value;
    			add_location(option2, file$d, 434, 16, 16753);
    			option3.__value = "counter";
    			option3.value = option3.__value;
    			add_location(option3, file$d, 435, 16, 16819);
    			attr_dev(select, "class", "svelte-5f4r5t");
    			if (/*charge*/ ctx[68].layer === void 0) add_render_callback(select_change_handler_3);
    			add_location(select, file$d, 431, 14, 16579);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			select_option(select, /*charge*/ ctx[68].layer);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", select_change_handler_3);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*menu, chargeTypes*/ 514) {
    				select_option(select, /*charge*/ ctx[68].layer);
    			}
    		},
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
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(430:12) {#if coa.division}",
    		ctx
    	});

    	return block;
    }

    // (443:10) {#each Object.keys(charges[charge.type]).map(c => new Object({c, t1: coa.t1, charges: [{charge:c, t: charge.t, p:"e", size: 1.5, sinister: charge.sinister, reversed: charge.reversed}]})) as coa (coa)}
    function create_each_block_2$3(key_1, ctx) {
    	let div;
    	let menuitem;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	menuitem = new MenuItem({
    			props: {
    				coa: /*coa*/ ctx[0],
    				title: cap(/*coa*/ ctx[0].c),
    				itemSize: /*itemSize*/ ctx[7]
    			},
    			$$inline: true
    		});

    	function click_handler_9(...args) {
    		return /*click_handler_9*/ ctx[47](/*charge*/ ctx[68], /*coa*/ ctx[0], /*each_value*/ ctx[69], /*i*/ ctx[70], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(menuitem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "item");
    			toggle_class(div, "selected", /*charge*/ ctx[68].charge === /*coa*/ ctx[0].c);
    			add_location(div, file$d, 443, 12, 17254);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menuitem, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_9, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const menuitem_changes = {};
    			if (dirty[0] & /*menu, coa*/ 3) menuitem_changes.coa = /*coa*/ ctx[0];
    			if (dirty[0] & /*menu, coa*/ 3) menuitem_changes.title = cap(/*coa*/ ctx[0].c);
    			menuitem.$set(menuitem_changes);

    			if (dirty[0] & /*menu, coa*/ 3) {
    				toggle_class(div, "selected", /*charge*/ ctx[68].charge === /*coa*/ ctx[0].c);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menuitem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$3.name,
    		type: "each",
    		source: "(443:10) {#each Object.keys(charges[charge.type]).map(c => new Object({c, t1: coa.t1, charges: [{charge:c, t: charge.t, p:\\\"e\\\", size: 1.5, sinister: charge.sinister, reversed: charge.reversed}]})) as coa (coa)}",
    		ctx
    	});

    	return block;
    }

    // (450:8) {#if charge.layer !== "counter"}
    function create_if_block$7(ctx) {
    	let div;
    	let editortincture;
    	let updating_t1;
    	let current;

    	function editortincture_t1_binding_5(value) {
    		/*editortincture_t1_binding_5*/ ctx[48].call(null, value, /*charge*/ ctx[68]);
    	}

    	let editortincture_props = { itemSize: /*itemSize*/ ctx[7] };

    	if (/*charge*/ ctx[68].t !== void 0) {
    		editortincture_props.t1 = /*charge*/ ctx[68].t;
    	}

    	editortincture = new EditorTincture({
    			props: editortincture_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editortincture, "t1", editortincture_t1_binding_5));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editortincture.$$.fragment);
    			attr_dev(div, "class", "subsection svelte-5f4r5t");
    			add_location(div, file$d, 450, 10, 17524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editortincture, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const editortincture_changes = {};

    			if (!updating_t1 && dirty[0] & /*menu*/ 2) {
    				updating_t1 = true;
    				editortincture_changes.t1 = /*charge*/ ctx[68].t;
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
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(450:8) {#if charge.layer !== \\\"counter\\\"}",
    		ctx
    	});

    	return block;
    }

    // (461:12) {#each positionsArray as position}
    function create_each_block_1$3(ctx) {
    	let option;
    	let t_value = /*position*/ ctx[71] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*position*/ ctx[71];
    			option.value = option.__value;
    			add_location(option, file$d, 461, 14, 18165);
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
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(461:12) {#each positionsArray as position}",
    		ctx
    	});

    	return block;
    }

    // (418:4) {#each menu.charges as charge, i}
    function create_each_block$6(ctx) {
    	let div0;
    	let t0;

    	let t1_value = (/*menu*/ ctx[1].charges.length > 1
    	? /*i*/ ctx[70] + 1
    	: "") + "";

    	let t1;
    	let div0_intro;
    	let t2;
    	let div5;
    	let div2;
    	let div1;
    	let t3;
    	let select0;
    	let t4;
    	let t5;
    	let b;
    	let t7;
    	let each_blocks_1 = [];
    	let each1_lookup = new Map();
    	let t8;
    	let t9;
    	let div3;
    	let t10;
    	let input0;
    	let t11;
    	let select1;
    	let t12;
    	let span0;
    	let t14;
    	let input1;
    	let t15;
    	let span1;
    	let t17;
    	let switch0;
    	let updating_checked;
    	let t18;
    	let span2;
    	let t20;
    	let switch1;
    	let updating_checked_1;
    	let t21;
    	let div4;
    	let span3;
    	let t23;
    	let input2;
    	let t24;
    	let span4;
    	let t26;
    	let input3;
    	let t27;
    	let input4;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*chargeTypes*/ ctx[9];
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	function select0_change_handler() {
    		/*select0_change_handler*/ ctx[43].call(select0, /*each_value*/ ctx[69], /*i*/ ctx[70]);
    	}

    	let if_block0 = /*coa*/ ctx[0].division && create_if_block_1$4(ctx);

    	function click_handler_8(...args) {
    		return /*click_handler_8*/ ctx[45](/*i*/ ctx[70], ...args);
    	}

    	function func_8(...args) {
    		return /*func_8*/ ctx[46](/*charge*/ ctx[68], ...args);
    	}

    	let each_value_2 = Object.keys(charges[/*charge*/ ctx[68].type]).map(func_8);
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*coa*/ ctx[0];
    	validate_each_keys(ctx, each_value_2, get_each_context_2$3, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2$3(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each1_lookup.set(key, each_blocks_1[i] = create_each_block_2$3(key, child_ctx));
    	}

    	let if_block1 = /*charge*/ ctx[68].layer !== "counter" && create_if_block$7(ctx);

    	function input0_input_handler() {
    		/*input0_input_handler*/ ctx[49].call(input0, /*each_value*/ ctx[69], /*i*/ ctx[70]);
    	}

    	function input_handler(...args) {
    		return /*input_handler*/ ctx[50](/*charge*/ ctx[68], ...args);
    	}

    	function focus_handler(...args) {
    		return /*focus_handler*/ ctx[51](/*charge*/ ctx[68], ...args);
    	}

    	let each_value_1 = positionsArray;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	function select1_change_handler() {
    		/*select1_change_handler*/ ctx[53].call(select1, /*each_value*/ ctx[69], /*i*/ ctx[70]);
    	}

    	function input_handler_1(...args) {
    		return /*input_handler_1*/ ctx[54](/*charge*/ ctx[68], ...args);
    	}

    	function focus_handler_1(...args) {
    		return /*focus_handler_1*/ ctx[55](/*charge*/ ctx[68], ...args);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[57].call(input1, /*each_value*/ ctx[69], /*i*/ ctx[70]);
    	}

    	function switch0_checked_binding(value) {
    		/*switch0_checked_binding*/ ctx[58].call(null, value, /*charge*/ ctx[68]);
    	}

    	let switch0_props = {};

    	if (/*charge*/ ctx[68].sinister !== void 0) {
    		switch0_props.checked = /*charge*/ ctx[68].sinister;
    	}

    	switch0 = new Switch({ props: switch0_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch0, "checked", switch0_checked_binding));

    	function switch1_checked_binding(value) {
    		/*switch1_checked_binding*/ ctx[59].call(null, value, /*charge*/ ctx[68]);
    	}

    	let switch1_props = {};

    	if (/*charge*/ ctx[68].reversed !== void 0) {
    		switch1_props.checked = /*charge*/ ctx[68].reversed;
    	}

    	switch1 = new Switch({ props: switch1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch1, "checked", switch1_checked_binding));

    	function input2_input_handler() {
    		/*input2_input_handler*/ ctx[60].call(input2, /*each_value*/ ctx[69], /*i*/ ctx[70]);
    	}

    	function input3_input_handler() {
    		/*input3_input_handler*/ ctx[61].call(input3, /*each_value*/ ctx[69], /*i*/ ctx[70]);
    	}

    	function input4_input_handler() {
    		/*input4_input_handler*/ ctx[62].call(input4, /*each_value*/ ctx[69], /*i*/ ctx[70]);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Charge ");
    			t1 = text(t1_value);
    			t2 = space();
    			div5 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			t3 = text("Category:\r\n            ");
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			b = element("b");
    			b.textContent = "✖";
    			t7 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t8 = space();
    			if (if_block1) if_block1.c();
    			t9 = space();
    			div3 = element("div");
    			t10 = text("Positions:\r\n          ");
    			input0 = element("input");
    			t11 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t12 = space();
    			span0 = element("span");
    			span0.textContent = "Size:";
    			t14 = space();
    			input1 = element("input");
    			t15 = space();
    			span1 = element("span");
    			span1.textContent = "Sinister:";
    			t17 = space();
    			create_component(switch0.$$.fragment);
    			t18 = space();
    			span2 = element("span");
    			span2.textContent = "Reversed:";
    			t20 = space();
    			create_component(switch1.$$.fragment);
    			t21 = space();
    			div4 = element("div");
    			span3 = element("span");
    			span3.textContent = "Rotation:";
    			t23 = space();
    			input2 = element("input");
    			t24 = space();
    			span4 = element("span");
    			span4.textContent = "Shift:";
    			t26 = space();
    			input3 = element("input");
    			t27 = space();
    			input4 = element("input");
    			attr_dev(div0, "class", "section svelte-5f4r5t");
    			add_location(div0, file$d, 418, 6, 16056);
    			attr_dev(select0, "class", "svelte-5f4r5t");
    			if (/*charge*/ ctx[68].type === void 0) add_render_callback(select0_change_handler);
    			add_location(select0, file$d, 423, 12, 16261);
    			attr_dev(b, "class", "removeButton svelte-5f4r5t");
    			attr_dev(b, "title", "Remove charge");
    			add_location(b, file$d, 439, 12, 16924);
    			add_location(div1, file$d, 422, 10, 16233);
    			attr_dev(div2, "class", "subsection svelte-5f4r5t");
    			add_location(div2, file$d, 421, 8, 16197);
    			set_style(input0, "margin-left", ".6em");
    			set_style(input0, "width", "8.6em");
    			add_location(input0, file$d, 457, 10, 17712);
    			attr_dev(select1, "class", "pseudoSelect svelte-5f4r5t");
    			if (/*charge*/ ctx[68].p === void 0) add_render_callback(select1_change_handler);
    			add_location(select1, file$d, 459, 10, 17923);
    			set_style(span0, "margin-left", "1em");
    			add_location(span0, file$d, 465, 10, 18265);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", ".1");
    			attr_dev(input1, "max", "2");
    			attr_dev(input1, "step", ".01");
    			add_location(input1, file$d, 466, 10, 18320);
    			set_style(span1, "margin-left", "1em");
    			add_location(span1, file$d, 468, 10, 18403);
    			set_style(span2, "margin-left", "1em");
    			add_location(span2, file$d, 471, 10, 18516);
    			attr_dev(div3, "class", "subsection svelte-5f4r5t");
    			add_location(div3, file$d, 455, 8, 17654);
    			add_location(span3, file$d, 476, 10, 18679);
    			set_style(input2, "margin-left", "1em");
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "-180");
    			attr_dev(input2, "max", "180");
    			add_location(input2, file$d, 477, 10, 18713);
    			set_style(span4, "margin-left", "1em");
    			add_location(span4, file$d, 479, 10, 18817);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "min", "-100");
    			attr_dev(input3, "max", "100");
    			attr_dev(input3, "step", /*$grid*/ ctx[3]);
    			add_location(input3, file$d, 480, 10, 18873);
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "min", "-100");
    			attr_dev(input4, "max", "100");
    			attr_dev(input4, "step", /*$grid*/ ctx[3]);
    			add_location(input4, file$d, 481, 10, 18959);
    			attr_dev(div4, "class", "subsection svelte-5f4r5t");
    			add_location(div4, file$d, 475, 8, 18643);
    			attr_dev(div5, "class", "panel svelte-5f4r5t");
    			add_location(div5, file$d, 419, 6, 16166);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div1, select0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(select0, null);
    			}

    			select_option(select0, /*charge*/ ctx[68].type);
    			append_dev(div1, t4);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t5);
    			append_dev(div1, b);
    			append_dev(div2, t7);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(div5, t8);
    			if (if_block1) if_block1.m(div5, null);
    			append_dev(div5, t9);
    			append_dev(div5, div3);
    			append_dev(div3, t10);
    			append_dev(div3, input0);
    			set_input_value(input0, /*charge*/ ctx[68].p);
    			append_dev(div3, t11);
    			append_dev(div3, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*charge*/ ctx[68].p);
    			append_dev(div3, t12);
    			append_dev(div3, span0);
    			append_dev(div3, t14);
    			append_dev(div3, input1);
    			set_input_value(input1, /*charge*/ ctx[68].size);
    			append_dev(div3, t15);
    			append_dev(div3, span1);
    			append_dev(div3, t17);
    			mount_component(switch0, div3, null);
    			append_dev(div3, t18);
    			append_dev(div3, span2);
    			append_dev(div3, t20);
    			mount_component(switch1, div3, null);
    			append_dev(div5, t21);
    			append_dev(div5, div4);
    			append_dev(div4, span3);
    			append_dev(div4, t23);
    			append_dev(div4, input2);
    			set_input_value(input2, /*charge*/ ctx[68].angle);
    			append_dev(div4, t24);
    			append_dev(div4, span4);
    			append_dev(div4, t26);
    			append_dev(div4, input3);
    			set_input_value(input3, /*charge*/ ctx[68].x);
    			append_dev(div4, t27);
    			append_dev(div4, input4);
    			set_input_value(input4, /*charge*/ ctx[68].y);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", showSection, false, false, false),
    					listen_dev(select0, "change", select0_change_handler),
    					listen_dev(select0, "input", updateSection, false, false, false),
    					listen_dev(b, "click", click_handler_8, false, false, false),
    					listen_dev(input0, "input", input0_input_handler),
    					listen_dev(input0, "input", input_handler, false, false, false),
    					listen_dev(input0, "focus", focus_handler, false, false, false),
    					listen_dev(input0, "blur", /*blur_handler*/ ctx[52], false, false, false),
    					listen_dev(select1, "change", select1_change_handler),
    					listen_dev(select1, "input", input_handler_1, false, false, false),
    					listen_dev(select1, "focus", focus_handler_1, false, false, false),
    					listen_dev(select1, "blur", /*blur_handler_1*/ ctx[56], false, false, false),
    					listen_dev(input1, "input", input1_input_handler),
    					listen_dev(input2, "input", input2_input_handler),
    					listen_dev(input3, "input", input3_input_handler),
    					listen_dev(input4, "input", input4_input_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if ((!current || dirty[0] & /*menu*/ 2) && t1_value !== (t1_value = (/*menu*/ ctx[1].charges.length > 1
    			? /*i*/ ctx[70] + 1
    			: "") + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*chargeTypes*/ 512) {
    				each_value_3 = /*chargeTypes*/ ctx[9];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if (dirty[0] & /*menu, chargeTypes*/ 514) {
    				select_option(select0, /*charge*/ ctx[68].type);
    			}

    			if (/*coa*/ ctx[0].division) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					if_block0.m(div1, t5);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*menu, coa, itemSize*/ 131) {
    				const each_value_2 = Object.keys(charges[/*charge*/ ctx[68].type]).map(func_8);
    				validate_each_argument(each_value_2);
    				group_outros();
    				validate_each_keys(ctx, each_value_2, get_each_context_2$3, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_2, each1_lookup, div2, outro_and_destroy_block, create_each_block_2$3, null, get_each_context_2$3);
    				check_outros();
    			}

    			if (/*charge*/ ctx[68].layer !== "counter") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$7(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div5, t9);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*menu, chargeTypes*/ 514 && input0.value !== /*charge*/ ctx[68].p) {
    				set_input_value(input0, /*charge*/ ctx[68].p);
    			}

    			if (dirty & /*positionsArray*/ 0) {
    				each_value_1 = positionsArray;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*menu, chargeTypes*/ 514) {
    				select_option(select1, /*charge*/ ctx[68].p);
    			}

    			if (dirty[0] & /*menu, chargeTypes*/ 514 && to_number(input1.value) !== /*charge*/ ctx[68].size) {
    				set_input_value(input1, /*charge*/ ctx[68].size);
    			}

    			const switch0_changes = {};

    			if (!updating_checked && dirty[0] & /*menu*/ 2) {
    				updating_checked = true;
    				switch0_changes.checked = /*charge*/ ctx[68].sinister;
    				add_flush_callback(() => updating_checked = false);
    			}

    			switch0.$set(switch0_changes);
    			const switch1_changes = {};

    			if (!updating_checked_1 && dirty[0] & /*menu*/ 2) {
    				updating_checked_1 = true;
    				switch1_changes.checked = /*charge*/ ctx[68].reversed;
    				add_flush_callback(() => updating_checked_1 = false);
    			}

    			switch1.$set(switch1_changes);

    			if (dirty[0] & /*menu, chargeTypes*/ 514 && to_number(input2.value) !== /*charge*/ ctx[68].angle) {
    				set_input_value(input2, /*charge*/ ctx[68].angle);
    			}

    			if (!current || dirty[0] & /*$grid*/ 8) {
    				attr_dev(input3, "step", /*$grid*/ ctx[3]);
    			}

    			if (dirty[0] & /*menu, chargeTypes*/ 514 && to_number(input3.value) !== /*charge*/ ctx[68].x) {
    				set_input_value(input3, /*charge*/ ctx[68].x);
    			}

    			if (!current || dirty[0] & /*$grid*/ 8) {
    				attr_dev(input4, "step", /*$grid*/ ctx[3]);
    			}

    			if (dirty[0] & /*menu, chargeTypes*/ 514 && to_number(input4.value) !== /*charge*/ ctx[68].y) {
    				set_input_value(input4, /*charge*/ ctx[68].y);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (!div0_intro) {
    				add_render_callback(() => {
    					div0_intro = create_in_transition(div0, slide, {});
    					div0_intro.start();
    				});
    			}

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(if_block1);
    			transition_in(switch0.$$.fragment, local);
    			transition_in(switch1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(if_block1);
    			transition_out(switch0.$$.fragment, local);
    			transition_out(switch1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks_2, detaching);
    			if (if_block0) if_block0.d();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			destroy_component(switch0);
    			destroy_component(switch1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(418:4) {#each menu.charges as charge, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div12;
    	let previous_key = /*coa*/ ctx[0];
    	let t0;
    	let div11;
    	let div0;
    	let t2;
    	let div3;
    	let div1;
    	let editortype;
    	let updating_type;
    	let t3;
    	let t4;
    	let div2;
    	let editortincture;
    	let updating_t1;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let div4;
    	let t10;
    	let div6;
    	let div5;
    	let each_blocks_2 = [];
    	let each0_lookup = new Map();
    	let t11;
    	let t12;
    	let t13;
    	let div7;
    	let t15;
    	let div9;
    	let t16;
    	let div8;
    	let each_blocks_1 = [];
    	let each1_lookup = new Map();
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let div10;
    	let div11_intro;
    	let current;
    	let mounted;
    	let dispose;
    	let key_block = create_key_block(ctx);

    	function editortype_type_binding(value) {
    		/*editortype_type_binding*/ ctx[15].call(null, value);
    	}

    	let editortype_props = { updateSection };

    	if (/*menu*/ ctx[1].field.type !== void 0) {
    		editortype_props.type = /*menu*/ ctx[1].field.type;
    	}

    	editortype = new EditorType({ props: editortype_props, $$inline: true });
    	binding_callbacks.push(() => bind(editortype, "type", editortype_type_binding));
    	let if_block0 = /*menu*/ ctx[1].field.type !== "tincture" && create_if_block_14$1(ctx);

    	function editortincture_t1_binding(value) {
    		/*editortincture_t1_binding*/ ctx[17].call(null, value);
    	}

    	let editortincture_props = { itemSize: /*itemSize*/ ctx[7] };

    	if (/*menu*/ ctx[1].field.t1 !== void 0) {
    		editortincture_props.t1 = /*menu*/ ctx[1].field.t1;
    	}

    	editortincture = new EditorTincture({
    			props: editortincture_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editortincture, "t1", editortincture_t1_binding));
    	let if_block1 = /*menu*/ ctx[1].field.type !== "tincture" && create_if_block_13$2(ctx);
    	let if_block2 = /*menu*/ ctx[1].field.type === "pattern" && create_if_block_12$2(ctx);
    	let if_block3 = /*menu*/ ctx[1].field.type === "semy" && create_if_block_11$2(ctx);
    	let each_value_10 = ["no"].concat(Object.keys(divisions.variants)).map(/*func_2*/ ctx[24]);
    	validate_each_argument(each_value_10);
    	const get_key = ctx => /*coa*/ ctx[0];
    	validate_each_keys(ctx, each_value_10, get_each_context_10, get_key);

    	for (let i = 0; i < each_value_10.length; i += 1) {
    		let child_ctx = get_each_context_10(ctx, each_value_10, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_2[i] = create_each_block_10(key, child_ctx));
    	}

    	let if_block4 = divisions[/*coa*/ ctx[0].division?.division] && create_if_block_10$2(ctx);
    	let if_block5 = /*coa*/ ctx[0].division && create_if_block_5$3(ctx);
    	let if_block6 = /*coa*/ ctx[0].division && create_if_block_4$3(ctx);
    	let each_value_5 = /*ordinariesList*/ ctx[10].map(/*func_6*/ ctx[38]);
    	validate_each_argument(each_value_5);
    	const get_key_1 = ctx => /*coa*/ ctx[0];
    	validate_each_keys(ctx, each_value_5, get_each_context_5, get_key_1);

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		let child_ctx = get_each_context_5(ctx, each_value_5, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks_1[i] = create_each_block_5(key, child_ctx));
    	}

    	let if_block7 = ordinaries.lined[/*menu*/ ctx[1].ordinary.ordinary] && create_if_block_3$3(ctx);
    	let if_block8 = /*coa*/ ctx[0].ordinary && /*menu*/ ctx[1].ordinary.divided !== "counter" && create_if_block_2$3(ctx);
    	let each_value = /*menu*/ ctx[1].charges;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			key_block.c();
    			t0 = space();
    			div11 = element("div");
    			div0 = element("div");
    			div0.textContent = "Field";
    			t2 = space();
    			div3 = element("div");
    			div1 = element("div");
    			create_component(editortype.$$.fragment);
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			div2 = element("div");
    			create_component(editortincture.$$.fragment);
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			if (if_block3) if_block3.c();
    			t8 = space();
    			div4 = element("div");
    			div4.textContent = "Division";
    			t10 = space();
    			div6 = element("div");
    			div5 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t11 = space();
    			if (if_block4) if_block4.c();
    			t12 = space();
    			if (if_block5) if_block5.c();
    			t13 = space();
    			div7 = element("div");
    			div7.textContent = "Ordinary";
    			t15 = space();
    			div9 = element("div");
    			if (if_block6) if_block6.c();
    			t16 = space();
    			div8 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t17 = space();
    			if (if_block7) if_block7.c();
    			t18 = space();
    			if (if_block8) if_block8.c();
    			t19 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t20 = space();
    			div10 = element("div");
    			div10.textContent = "Add charge";
    			attr_dev(div0, "class", "section svelte-5f4r5t");
    			toggle_class(div0, "expanded", false);
    			add_location(div0, file$d, 254, 4, 8842);
    			attr_dev(div1, "class", "subsection svelte-5f4r5t");
    			add_location(div1, file$d, 256, 6, 8953);
    			attr_dev(div2, "class", "subsection svelte-5f4r5t");
    			add_location(div2, file$d, 263, 6, 9182);
    			attr_dev(div3, "class", "panel svelte-5f4r5t");
    			add_location(div3, file$d, 255, 4, 8926);
    			attr_dev(div4, "class", "section svelte-5f4r5t");
    			add_location(div4, file$d, 305, 4, 10825);
    			attr_dev(div5, "class", "subsection svelte-5f4r5t");
    			add_location(div5, file$d, 307, 6, 10916);
    			attr_dev(div6, "class", "panel svelte-5f4r5t");
    			add_location(div6, file$d, 306, 4, 10889);
    			attr_dev(div7, "class", "section svelte-5f4r5t");
    			add_location(div7, file$d, 376, 4, 14069);
    			attr_dev(div8, "class", "subsection svelte-5f4r5t");
    			add_location(div8, file$d, 390, 6, 14607);
    			attr_dev(div9, "class", "panel svelte-5f4r5t");
    			add_location(div9, file$d, 377, 4, 14133);
    			attr_dev(div10, "class", "buttonLine svelte-5f4r5t");
    			add_location(div10, file$d, 486, 4, 19084);
    			attr_dev(div11, "id", "menu");
    			set_style(div11, "width", /*width*/ ctx[5] + "%");
    			set_style(div11, "height", /*height*/ ctx[6]);
    			attr_dev(div11, "class", "svelte-5f4r5t");
    			add_location(div11, file$d, 252, 2, 8750);
    			attr_dev(div12, "id", "editor");
    			attr_dev(div12, "class", "svelte-5f4r5t");
    			add_location(div12, file$d, 248, 0, 8654);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			key_block.m(div12, null);
    			append_dev(div12, t0);
    			append_dev(div12, div11);
    			append_dev(div11, div0);
    			append_dev(div11, t2);
    			append_dev(div11, div3);
    			append_dev(div3, div1);
    			mount_component(editortype, div1, null);
    			append_dev(div1, t3);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			mount_component(editortincture, div2, null);
    			append_dev(div3, t5);
    			if (if_block1) if_block1.m(div3, null);
    			append_dev(div3, t6);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(div3, t7);
    			if (if_block3) if_block3.m(div3, null);
    			append_dev(div11, t8);
    			append_dev(div11, div4);
    			append_dev(div11, t10);
    			append_dev(div11, div6);
    			append_dev(div6, div5);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div5, null);
    			}

    			append_dev(div6, t11);
    			if (if_block4) if_block4.m(div6, null);
    			append_dev(div6, t12);
    			if (if_block5) if_block5.m(div6, null);
    			append_dev(div11, t13);
    			append_dev(div11, div7);
    			append_dev(div11, t15);
    			append_dev(div11, div9);
    			if (if_block6) if_block6.m(div9, null);
    			append_dev(div9, t16);
    			append_dev(div9, div8);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div8, null);
    			}

    			append_dev(div9, t17);
    			if (if_block7) if_block7.m(div9, null);
    			append_dev(div9, t18);
    			if (if_block8) if_block8.m(div9, null);
    			append_dev(div11, t19);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div11, null);
    			}

    			append_dev(div11, t20);
    			append_dev(div11, div10);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", showSection, false, false, false),
    					listen_dev(div4, "click", showSection, false, false, false),
    					listen_dev(div5, "click", updateSection, false, false, false),
    					listen_dev(div7, "click", showSection, false, false, false),
    					listen_dev(div8, "click", updateSection, false, false, false),
    					listen_dev(div10, "click", /*addCharge*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*coa*/ 1 && safe_not_equal(previous_key, previous_key = /*coa*/ ctx[0])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(div12, t0);
    			} else {
    				key_block.p(ctx, dirty);
    			}

    			const editortype_changes = {};

    			if (!updating_type && dirty[0] & /*menu*/ 2) {
    				updating_type = true;
    				editortype_changes.type = /*menu*/ ctx[1].field.type;
    				add_flush_callback(() => updating_type = false);
    			}

    			editortype.$set(editortype_changes);

    			if (/*menu*/ ctx[1].field.type !== "tincture") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_14$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const editortincture_changes = {};

    			if (!updating_t1 && dirty[0] & /*menu*/ 2) {
    				updating_t1 = true;
    				editortincture_changes.t1 = /*menu*/ ctx[1].field.t1;
    				add_flush_callback(() => updating_t1 = false);
    			}

    			editortincture.$set(editortincture_changes);

    			if (/*menu*/ ctx[1].field.type !== "tincture") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_13$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div3, t6);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*menu*/ ctx[1].field.type === "pattern") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_12$2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div3, t7);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*menu*/ ctx[1].field.type === "semy") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 2) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_11$2(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div3, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*menu, coa, itemSize*/ 131) {
    				const each_value_10 = ["no"].concat(Object.keys(divisions.variants)).map(/*func_2*/ ctx[24]);
    				validate_each_argument(each_value_10);
    				group_outros();
    				validate_each_keys(ctx, each_value_10, get_each_context_10, get_key);
    				each_blocks_2 = update_keyed_each(each_blocks_2, dirty, get_key, 1, ctx, each_value_10, each0_lookup, div5, outro_and_destroy_block, create_each_block_10, null, get_each_context_10);
    				check_outros();
    			}

    			if (divisions[/*coa*/ ctx[0].division?.division]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*coa*/ 1) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_10$2(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div6, t12);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*coa*/ ctx[0].division) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty[0] & /*coa*/ 1) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_5$3(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div6, null);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*coa*/ ctx[0].division) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_4$3(ctx);
    					if_block6.c();
    					if_block6.m(div9, t16);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (dirty[0] & /*menu, ordinariesList, coa, itemSize*/ 1155) {
    				const each_value_5 = /*ordinariesList*/ ctx[10].map(/*func_6*/ ctx[38]);
    				validate_each_argument(each_value_5);
    				group_outros();
    				validate_each_keys(ctx, each_value_5, get_each_context_5, get_key_1);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key_1, 1, ctx, each_value_5, each1_lookup, div8, outro_and_destroy_block, create_each_block_5, null, get_each_context_5);
    				check_outros();
    			}

    			if (ordinaries.lined[/*menu*/ ctx[1].ordinary.ordinary]) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);

    					if (dirty[0] & /*menu*/ 2) {
    						transition_in(if_block7, 1);
    					}
    				} else {
    					if_block7 = create_if_block_3$3(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(div9, t18);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}

    			if (/*coa*/ ctx[0].ordinary && /*menu*/ ctx[1].ordinary.divided !== "counter") {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);

    					if (dirty[0] & /*coa, menu*/ 3) {
    						transition_in(if_block8, 1);
    					}
    				} else {
    					if_block8 = create_if_block_2$3(ctx);
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(div9, null);
    				}
    			} else if (if_block8) {
    				group_outros();

    				transition_out(if_block8, 1, 1, () => {
    					if_block8 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*$grid, menu, $state, itemSize, coa, removeCharge, chargeTypes*/ 4751) {
    				each_value = /*menu*/ ctx[1].charges;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div11, t20);
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
    			transition_in(key_block);
    			transition_in(editortype.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(editortincture.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);

    			for (let i = 0; i < each_value_10.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			transition_in(if_block4);
    			transition_in(if_block5);

    			for (let i = 0; i < each_value_5.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(if_block7);
    			transition_in(if_block8);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			if (!div11_intro) {
    				add_render_callback(() => {
    					div11_intro = create_in_transition(div11, /*rolling*/ ctx[13], {});
    					div11_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			transition_out(editortype.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(editortincture.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			transition_out(if_block4);
    			transition_out(if_block5);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(if_block7);
    			transition_out(if_block8);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    			key_block.d(detaching);
    			destroy_component(editortype);
    			if (if_block0) if_block0.d();
    			destroy_component(editortincture);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].d();
    			}

    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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

    function showSection(e) {
    	e.target.classList.toggle("expanded");
    	const panel = e.target.nextElementSibling;
    	if (panel.style.maxHeight) panel.style.maxHeight = null; else panel.style.maxHeight = panel.scrollHeight + "px";
    }

    function updateSection(e) {
    	const panel = e.currentTarget.closest(".panel");
    	setTimeout(() => panel.style.maxHeight = panel.scrollHeight + "px", 100);
    }

    function cap(string = "no") {
    	const split = string.split(/(?=[A-Z])/).join(" ");
    	return split.charAt(0).toUpperCase() + split.slice(1);
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $changes;
    	let $state;
    	let $grid;
    	validate_store(changes, "changes");
    	component_subscribe($$self, changes, $$value => $$invalidate(64, $changes = $$value));
    	validate_store(state, "state");
    	component_subscribe($$self, state, $$value => $$invalidate(2, $state = $$value));
    	validate_store(grid, "grid");
    	component_subscribe($$self, grid, $$value => $$invalidate(3, $grid = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Editor", slots, []);
    	let { coa } = $$props, { c } = $$props;
    	const min = Math.min(window.innerWidth, window.innerHeight);
    	const ratio = window.innerHeight / window.innerWidth;
    	const coaSize = Math.round(min * 0.9);

    	const width = window.innerWidth < 600 || ratio > 1
    	? 100
    	: Math.round((1.05 - ratio) * 100); // 56.25;

    	const height = width === 100 ? null : "calc(100% - 45px)";
    	const itemSize = Math.round(width * 1.473);

    	const patterns = [
    		"vair",
    		"vairInPale",
    		"vairEnPointe",
    		"ermine",
    		"chequy",
    		"lozengy",
    		"fusily",
    		"pally",
    		"barry",
    		"gemelles",
    		"bendy",
    		"bendySinister",
    		"palyBendy",
    		"pappellony",
    		"masoned",
    		"fretty"
    	];

    	const chargeTypes = Object.keys(charges.types);
    	const ordinariesList = ["no"].concat(Object.keys(ordinaries.lined)).concat(Object.keys(ordinaries.straight));
    	let menu = {}, change = 0;

    	// define initial menu state, run only when new coa is passed
    	function defineMenuState() {
    		// Field
    		$$invalidate(1, menu.field = getField(), menu);

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
    				t2 = selectSecondTincture(coa.t1, "field");
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
    		$$invalidate(1, menu.division = getDivision(), menu);

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
    				? selectSecondTincture(t1, "division")
    				: tSplit[2];

    				if (type === "pattern") pattern = tSplit[0];

    				if (type === "semy") {
    					charge = getSemyCharge(tSplit);
    					semy = getSemyType(tSplit);
    				}

    				size = tSplit[3] || "standard";
    			} else {
    				t1 = selectSecondTincture(menu.field.t1, "division");
    				t2 = selectSecondTincture(t1, "division");
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

    		// Ordinary
    		$$invalidate(1, menu.ordinary = getOrdinary(), menu);

    		function getOrdinary() {
    			let ordinary = "no", line = "straight", t, divided = "";

    			if (coa.ordinary) {
    				ordinary = coa.ordinary.ordinary;
    				line = coa.ordinary.line || "straight";
    				t = coa.ordinary.t;
    				divided = coa.ordinary.divided || "";
    			} else {
    				t = rw(tinctures["colours"]["charge"]);
    			}

    			return { ordinary, line, t, divided };
    		}

    		// Charges
    		$$invalidate(1, menu.charges = getCharges(), menu);

    		function getCharges() {
    			if (!coa.charges) return [];

    			const charges = coa.charges.map(c => {
    				const { charge, t, p, size } = c;
    				const type = getChargeType(charge);
    				const layer = c.layer || "";
    				const sinister = c.sinister || false;
    				const reversed = c.reversed || false;
    				const x = c.x || 0;
    				const y = c.y || 0;
    				const angle = c.angle || 0;

    				return {
    					charge,
    					type,
    					layer,
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

    		function getChargeType(charge) {
    			return chargeTypes.find(type => charges[type][charge]);
    		}

    		function getSemyType(array) {
    			const charge = getSemyCharge(array);
    			return getChargeType(charge);
    		}

    		function selectSecondTincture(t1, type) {
    			const metal = t1 === "argent" || t1 === "or";
    			const tincturesType = metal ? tinctures["colours"] : tinctures["metals"];
    			return rw(tincturesType[type]);
    		}

    		return menu;
    	}

    	function addCharge() {
    		const type = rw(charges.single);
    		const charge = rw(charges[type]);
    		const t = rw(tinctures[rw(tinctures.charge)].charge);

    		const с = {
    			charge,
    			t,
    			p: "e",
    			type,
    			size: 1.5,
    			sinister: false,
    			reversed: false,
    			x: 0,
    			y: 0,
    			angle: 0,
    			layer: ""
    		};

    		$$invalidate(1, menu.charges = [...menu.charges, с], menu);
    	}

    	function removeCharge(index) {
    		$$invalidate(1, menu.charges = menu.charges.filter((e, i) => i !== index), menu);
    	}

    	function rolling(node, { duration = 1000 }) {
    		return {
    			duration,
    			css: t => `width: ${quartInOut(t) * width}%`
    		};
    	}

    	const writable_props = ["coa", "c"];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Editor> was created with unknown prop '${key}'`);
    	});

    	function editortype_type_binding(value) {
    		menu.field.type = value;
    		$$invalidate(1, menu);
    	}

    	function editorsize_size_binding(value) {
    		menu.field.size = value;
    		$$invalidate(1, menu);
    	}

    	function editortincture_t1_binding(value) {
    		menu.field.t1 = value;
    		$$invalidate(1, menu);
    	}

    	function editortincture_t1_binding_1(value) {
    		menu.field.t2 = value;
    		$$invalidate(1, menu);
    	}

    	const func = p => new Object({
    			t1: `${p}-${menu.field.t1}-${menu.field.t2}-${menu.field.size}`,
    			pattern: p
    		});

    	const click_handler = coa => $$invalidate(1, menu.field.pattern = coa.pattern, menu);

    	function select_change_handler() {
    		menu.field.semy = select_value(this);
    		$$invalidate(1, menu);
    		$$invalidate(9, chargeTypes);
    	}

    	const func_1 = c => new Object({
    			t1: `semy_of_${c}-${menu.field.t1}-${menu.field.t2}-${menu.field.size}`,
    			charge: c
    		});

    	const click_handler_1 = coa => $$invalidate(1, menu.field.charge = coa.charge, menu);

    	const func_2 = division => new Object({
    			t1: coa.t1,
    			division: {
    				division,
    				t: coa.division ? coa.division.t : menu.division.t1,
    				line: menu.division.line
    			}
    		});

    	const click_handler_2 = coa => $$invalidate(1, menu.division.division = coa.division.division, menu);

    	const func_3 = line => new Object({
    			t1: coa.t1,
    			division: {
    				division: menu.division.division,
    				t: coa.division ? coa.division.t : menu.division.t1,
    				line
    			}
    		});

    	const click_handler_3 = coa => $$invalidate(1, menu.division.line = coa.division.line, menu);

    	function editortype_type_binding_1(value) {
    		menu.division.type = value;
    		$$invalidate(1, menu);
    	}

    	function editorsize_size_binding_1(value) {
    		menu.division.size = value;
    		$$invalidate(1, menu);
    	}

    	function editortincture_t1_binding_2(value) {
    		menu.division.t1 = value;
    		$$invalidate(1, menu);
    	}

    	function editortincture_t1_binding_3(value) {
    		menu.division.t2 = value;
    		$$invalidate(1, menu);
    	}

    	const func_4 = p => new Object({
    			t1: `${p}-${menu.division.t1}-${menu.division.t2}-${menu.division.size}`,
    			pattern: p
    		});

    	const click_handler_4 = coa => $$invalidate(1, menu.division.pattern = coa.pattern, menu);

    	function select_change_handler_1() {
    		menu.division.semy = select_value(this);
    		$$invalidate(1, menu);
    		$$invalidate(9, chargeTypes);
    	}

    	const func_5 = c => new Object({
    			t1: `semy_of_${c}-${menu.division.t1}-${menu.division.t2}-${menu.division.size}`,
    			charge: c
    		});

    	const click_handler_5 = coa => $$invalidate(1, menu.division.charge = coa.charge, menu);

    	function select_change_handler_2() {
    		menu.ordinary.divided = select_value(this);
    		$$invalidate(1, menu);
    		$$invalidate(9, chargeTypes);
    	}

    	const func_6 = ordinary => new Object({
    			t1: coa.t1,
    			division: coa.division,
    			ordinary: {
    				ordinary,
    				line: menu.ordinary.line,
    				t: menu.ordinary.t,
    				divided: menu.ordinary.divided
    			}
    		});

    	const click_handler_6 = coa => $$invalidate(1, menu.ordinary.ordinary = coa.ordinary.ordinary, menu);

    	const func_7 = line => new Object({
    			t1: coa.t1,
    			division: coa.division,
    			ordinary: {
    				ordinary: menu.ordinary.ordinary,
    				line,
    				t: menu.ordinary.t,
    				divided: menu.ordinary.divided
    			}
    		});

    	const click_handler_7 = coa => $$invalidate(1, menu.ordinary.line = coa.ordinary.line, menu);

    	function editortincture_t1_binding_4(value) {
    		menu.ordinary.t = value;
    		$$invalidate(1, menu);
    	}

    	function select0_change_handler(each_value, i) {
    		each_value[i].type = select_value(this);
    		$$invalidate(1, menu);
    		$$invalidate(9, chargeTypes);
    	}

    	function select_change_handler_3(each_value, i) {
    		each_value[i].layer = select_value(this);
    		$$invalidate(1, menu);
    		$$invalidate(9, chargeTypes);
    	}

    	const click_handler_8 = i => removeCharge(i);

    	const func_8 = (charge, c) => new Object({
    			c,
    			t1: coa.t1,
    			charges: [
    				{
    					charge: c,
    					t: charge.t,
    					p: "e",
    					size: 1.5,
    					sinister: charge.sinister,
    					reversed: charge.reversed
    				}
    			]
    		});

    	const click_handler_9 = (charge, coa, each_value, i) => $$invalidate(1, each_value[i].charge = coa.c, menu);

    	function editortincture_t1_binding_5(value, charge) {
    		charge.t = value;
    		$$invalidate(1, menu);
    	}

    	function input0_input_handler(each_value, i) {
    		each_value[i].p = this.value;
    		$$invalidate(1, menu);
    		$$invalidate(9, chargeTypes);
    	}

    	const input_handler = charge => set_store_value(state, $state.positions = charge.p, $state);
    	const focus_handler = charge => set_store_value(state, $state.positions = charge.p, $state);
    	const blur_handler = () => set_store_value(state, $state.positions = 0, $state);

    	function select1_change_handler(each_value, i) {
    		each_value[i].p = select_value(this);
    		$$invalidate(1, menu);
    		$$invalidate(9, chargeTypes);
    	}

    	const input_handler_1 = charge => set_store_value(state, $state.positions = charge.p, $state);
    	const focus_handler_1 = charge => set_store_value(state, $state.positions = charge.p, $state);
    	const blur_handler_1 = () => set_store_value(state, $state.positions = 0, $state);

    	function input1_input_handler(each_value, i) {
    		each_value[i].size = to_number(this.value);
    		$$invalidate(1, menu);
    		$$invalidate(9, chargeTypes);
    	}

    	function switch0_checked_binding(value, charge) {
    		charge.sinister = value;
    		$$invalidate(1, menu);
    	}

    	function switch1_checked_binding(value, charge) {
    		charge.reversed = value;
    		$$invalidate(1, menu);
    	}

    	function input2_input_handler(each_value, i) {
    		each_value[i].angle = to_number(this.value);
    		$$invalidate(1, menu);
    		$$invalidate(9, chargeTypes);
    	}

    	function input3_input_handler(each_value, i) {
    		each_value[i].x = to_number(this.value);
    		$$invalidate(1, menu);
    		$$invalidate(9, chargeTypes);
    	}

    	function input4_input_handler(each_value, i) {
    		each_value[i].y = to_number(this.value);
    		$$invalidate(1, menu);
    		$$invalidate(9, chargeTypes);
    	}

    	$$self.$$set = $$props => {
    		if ("coa" in $$props) $$invalidate(0, coa = $$props.coa);
    		if ("c" in $$props) $$invalidate(14, c = $$props.c);
    	};

    	$$self.$capture_state = () => ({
    		COA,
    		MenuItem,
    		EditorType,
    		EditorSize,
    		EditorTincture,
    		Switch,
    		slide,
    		quartInOut,
    		rw,
    		changes,
    		state,
    		grid,
    		charges,
    		tinctures,
    		divisions,
    		ordinaries,
    		lines,
    		positionsArray,
    		coa,
    		c,
    		min,
    		ratio,
    		coaSize,
    		width,
    		height,
    		itemSize,
    		patterns,
    		chargeTypes,
    		ordinariesList,
    		menu,
    		change,
    		defineMenuState,
    		addCharge,
    		removeCharge,
    		rolling,
    		showSection,
    		updateSection,
    		cap,
    		$changes,
    		$state,
    		$grid
    	});

    	$$self.$inject_state = $$props => {
    		if ("coa" in $$props) $$invalidate(0, coa = $$props.coa);
    		if ("c" in $$props) $$invalidate(14, c = $$props.c);
    		if ("menu" in $$props) $$invalidate(1, menu = $$props.menu);
    		if ("change" in $$props) $$invalidate(63, change = $$props.change);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*c*/ 16384) {
    			// on reroll
    			 defineMenuState();
    		}

    		if ($$self.$$.dirty[2] & /*$changes*/ 4) {
    			// on undo or redo
    			 {
    				if (changes.length()) {
    					$$invalidate(0, coa = JSON.parse($changes[0]));
    					defineMenuState();
    					$$invalidate(63, change = 0);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*menu*/ 2) {
    			// field attributes changed
    			 {
    				if (menu.field.type === "tincture") $$invalidate(0, coa.t1 = menu.field.t1, coa); else {
    					const type = menu.field.type === "semy"
    					? "semy_of_" + menu.field.charge
    					: menu.field.pattern;

    					const attibutes = [type, menu.field.t1, menu.field.t2];
    					if (menu.field.size !== "standard") attibutes.push(menu.field.size);
    					$$invalidate(0, coa.t1 = attibutes.join("-"), coa);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*menu, coa*/ 3) {
    			// division attributes changed
    			 {
    				if (menu.division.division && menu.division.division !== "no") {
    					$$invalidate(0, coa.division = { division: menu.division.division }, coa);
    					if (divisions[menu.division.division]) $$invalidate(0, coa.division.line = menu.division.line, coa);

    					if (menu.division.type === "tincture") $$invalidate(0, coa.division.t = menu.division.t1, coa); else {
    						const attr0 = menu.division.type === "semy"
    						? "semy_of_" + menu.division.charge
    						: menu.division.pattern;

    						const attibutes = [attr0, menu.division.t1, menu.division.t2];
    						if (menu.division.size !== "standard") attibutes.push(menu.division.size);
    						$$invalidate(0, coa.division.t = attibutes.join("-"), coa);
    					}
    				} else delete coa.division;
    			}
    		}

    		if ($$self.$$.dirty[0] & /*menu, coa*/ 3) {
    			// ordinary attributes changed
    			 {
    				if (menu.ordinary && menu.ordinary.ordinary !== "no") {
    					$$invalidate(
    						0,
    						coa.ordinary = {
    							ordinary: menu.ordinary.ordinary,
    							t: menu.ordinary.t
    						},
    						coa
    					);

    					if (ordinaries.lined[menu.ordinary.ordinary]) $$invalidate(0, coa.ordinary.line = menu.ordinary.line, coa);
    					if (coa.division) $$invalidate(0, coa.ordinary.divided = menu.ordinary.divided, coa);
    				} else delete coa.ordinary;
    			}
    		}

    		if ($$self.$$.dirty[0] & /*menu, coa*/ 3) {
    			// charges attributes changed
    			 {
    				if (menu.charges.length) {
    					$$invalidate(
    						0,
    						coa.charges = menu.charges.map(c => {
    							const item = {
    								charge: c.charge,
    								t: c.t,
    								p: c.p,
    								size: c.size
    							};

    							if (c.layer) item.layer = c.layer;
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
    		}

    		if ($$self.$$.dirty[0] & /*coa*/ 1 | $$self.$$.dirty[2] & /*change*/ 2) {
    			// on coa change
    			 {
    				if (change) changes.add(JSON.stringify(coa));
    				$$invalidate(63, change = 1);
    			}
    		}
    	};

    	return [
    		coa,
    		menu,
    		$state,
    		$grid,
    		coaSize,
    		width,
    		height,
    		itemSize,
    		patterns,
    		chargeTypes,
    		ordinariesList,
    		addCharge,
    		removeCharge,
    		rolling,
    		c,
    		editortype_type_binding,
    		editorsize_size_binding,
    		editortincture_t1_binding,
    		editortincture_t1_binding_1,
    		func,
    		click_handler,
    		select_change_handler,
    		func_1,
    		click_handler_1,
    		func_2,
    		click_handler_2,
    		func_3,
    		click_handler_3,
    		editortype_type_binding_1,
    		editorsize_size_binding_1,
    		editortincture_t1_binding_2,
    		editortincture_t1_binding_3,
    		func_4,
    		click_handler_4,
    		select_change_handler_1,
    		func_5,
    		click_handler_5,
    		select_change_handler_2,
    		func_6,
    		click_handler_6,
    		func_7,
    		click_handler_7,
    		editortincture_t1_binding_4,
    		select0_change_handler,
    		select_change_handler_3,
    		click_handler_8,
    		func_8,
    		click_handler_9,
    		editortincture_t1_binding_5,
    		input0_input_handler,
    		input_handler,
    		focus_handler,
    		blur_handler,
    		select1_change_handler,
    		input_handler_1,
    		focus_handler_1,
    		blur_handler_1,
    		input1_input_handler,
    		switch0_checked_binding,
    		switch1_checked_binding,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler
    	];
    }

    class Editor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { coa: 0, c: 14 }, [-1, -1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Editor",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*coa*/ ctx[0] === undefined && !("coa" in props)) {
    			console_1$1.warn("<Editor> was created without expected prop 'coa'");
    		}

    		if (/*c*/ ctx[14] === undefined && !("c" in props)) {
    			console_1$1.warn("<Editor> was created without expected prop 'c'");
    		}
    	}

    	get coa() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set coa(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get c() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set c(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // main generation routine
    const generate = function(seed = Math.floor(Math.random() * 1e9)) {
      Math.seedrandom(seed); // define Math.random()

      // reset parameters to default
      tinctures.f = [];
      tinctures.pattern = null;

      const coa = {seed, t1: getTincture("field")};

      let charge = P(tinctures.pattern ? .5 : .9) ? true : false; // 80% for charge
      const linedOrdinary = charge && P(.3) || P(.5) ? rw(ordinaries.lined) : null;
      const ordinary = !charge && P(.6) || P(.3) ? linedOrdinary ? linedOrdinary : rw(ordinaries.straight) : null; // 36% for ordinary
      const rareDivided = ["chief", "terrace", "chevron", "quarter", "flaunches"].includes(ordinary);
      const divisioned = rareDivided ? P(.03) : charge && ordinary ? P(.03) : charge ? P(.3) : ordinary ? P(.7) : P(.995); // 33% for division
      const division = divisioned ? rw(divisions.variants) : null;

      const selectCharge = () => charge = ordinary || divisioned ? rw(charges[rw(charges.types)]) : rw(charges[rw(charges.single)]);
      if (charge) selectCharge();

      if (division) {
        const t = getTincture("division", tinctures.f, P(.98) ? coa.t1 : null);
        coa.division = {division, t};
        if (divisions[division]) coa.division.line = tinctures.pattern || (ordinary && P(.7)) ? "straight" : rw(divisions[division]);
      }

      if (ordinary) {
        coa.ordinary = {ordinary, t: getTincture("charge", tinctures.f, coa.t1)};
        if (linedOrdinary) coa.ordinary.line = tinctures.pattern || (division && P(.7)) ? "straight" : rw(lines);
        if (division && !charge && !tinctures.pattern && P(.5) && ordinary !== "bordure" && ordinary !== "orle") {
          if (P(.8)) coa.ordinary.divided = "counter"; // 40%
          else if (P(.6)) coa.ordinary.divided = "field"; // 6%
          else coa.ordinary.divided = "division"; // 4%
        }
      }

      if (charge) {
        let p = "e", t = "gules", ordinaryT = coa.ordinary?.t;
        if (positions.ordinariesOn[ordinary] && P(.8)) {
          // place charge over ordinary (use tincture of field type)
          p = rw(positions.ordinariesOn[ordinary]);
          while (charges.natural[charge] === ordinaryT) selectCharge();
          t = !tinctures.pattern && P(.3) ? coa.t1 : getTincture("charge", [], ordinaryT, charge);
        } else if (positions.ordinariesOff[ordinary] && P(.95)) {
          // place charge out of ordinary (use tincture of ordinary type)
          p = rw(positions.ordinariesOff[ordinary]);
          while (charges.natural[charge] === coa.t1) selectCharge();
          t = !tinctures.pattern && P(.3) ? ordinaryT : getTincture("charge", tinctures.f, coa.t1, charge);
        } else if (positions.divisions[division]) {
          // place charge in fields made by division
          p = rw(positions.divisions[division]);
          while (charges.natural[charge] === coa.t1) selectCharge();
          t = getTincture("charge", ordinaryT ? tinctures.f.concat(ordinaryT) : tinctures.f, coa.t1, charge);
        } else if (positions[charge]) {
          // place charge-suitable position
          p = rw(positions[charge]);
          while (charges.natural[charge] === coa.t1) selectCharge();
          t = getTincture("charge", tinctures.f, coa.t1, charge);
        } else {
          // place in standard position (use new tincture)
          p = tinctures.pattern ? "e" : charges.conventional[charge] ? rw(positions.conventional) : rw(positions.complex);
          while (charges.natural[charge] === coa.t1) selectCharge();
          t = getTincture("charge", tinctures.f.concat(ordinaryT), coa.t1, charge);
        }

        if (charges.natural[charge]) t = charges.natural[charge]; // natural tincture
        coa.charges = [{charge, t, p}];

        if (p === "ABCDEFGHIKL" && P(.95)) {
          // add central charge if charge is in bordure
          coa.charges[0].charge = rw(charges.conventional);
          coa.charges.push({"charge":rw(charges[rw(charges.single)]), t:getTincture("charge", tinctures.f, coa.t1, charge), p:"e"});
        } else if (P(.8) && charge.slice(0,12) === "inescutcheon") {
          // add charge to inescutcheon
          coa.charges.push({"charge":rw(charges[rw(charges.types)]), t:getTincture("charge", [], t, charge), p, size:.5});
        } else if (division && !ordinary) {
          const allowCounter = !tinctures.pattern && (!coa.line || coa.line === "straight");

          // dimidiation: second charge at division basic positons
          if (P(.3) && ["perPale", "perFess"].includes(division) && coa.line === "straight") {
            coa.charges[0].layer = "field";
            if (P(.95)) {
              const p2 = p === "e" || P(.5) ? "e" : rw(positions.divisions[division]);
              coa.charges.push({"charge":rw(charges[rw(charges.single)]), t:getTincture("charge", tinctures.f, coa.t3, charge), p: p2, layer:"division"});
            }
          }
          else if (allowCounter && P(.4)) coa.charges[0].layer = "counter"; // countercharged, 40%
          else if (["perPale", "perFess", "perBend", "perBendSinister"].includes(division)) { // place 2 charges in division standard positions
            const [p1, p2] = division === "perPale" ? ["pp", "qq"] :
                             division === "perFess" ? ["kk", "nn"] :
                             division === "perBend" ? ["ll", "mm"] :
                            ["jj", "oo"]; // perBendSinister
            coa.charges[0].p = p1;
            coa.charges.push({"charge":rw(charges[rw(charges.single)]), t:getTincture("charge", tinctures.f, coa.t3, charge), p: p2});
          }
          else if (allowCounter && p.length > 1) coa.charges[0].layer = "counter"; // countercharged, 40%
        }

        coa.charges.forEach(c => defineChargeAttributes(c));
        function defineChargeAttributes(c) {
          // define size
          let size = c.size || 1;
          if (c.p === "e" && (ordinary === "bordure" || ordinary === "orle")) size *= 1.1;
          else if (c.p === "e") size *= 1.5;
          else if (["pp", "qq", "kn", "kk", "nn", "oo", "jj"].includes(c.p)) size *= .7;
          else if (c.p === "jln" || c.p === "jlh") size *= .7;
          else if (c.p.length > 10) size *= .18; // >10 (bordure)
          else if (c.p.length > 7) size *= .3; // 8, 9, 10
          else if (c.p.length > 5) size *= .4; // 6, 7
          else if (c.p.length > 3) size *= .4; // 4 or 5
          else if (c.p.length > 1) size *= .5; // 2
          c.size = size;

          // define position
          c.p = [...new Set(c.p)].join("");

          // define orientation
          if (P(.05) && charges.sinister.includes(c.charge)) c.sinister = 1;
          if (P(.05) && charges.reversed.includes(c.charge)) c.reversed = 1;
        }
      }

      return coa;
    };

    // select tincture: element type (field, division, charge), all field tinctures, field type to follow RoT
    function getTincture(element, fields = [], RoT, charge) {
      if (charge && tinctures[charge]) element = charge;
      const base = RoT ? RoT.includes("-") ? RoT.split("-")[1] : RoT : null;

      let type = rw(tinctures[element]);
      if (type !== "patterns" && base) type = getType(base) === "metals" ? "colours" : "metals";
      if (type === "metals" && fields.includes("or") && fields.includes("argent")) type = "colours";
      let tincture = rw(tinctures[type][element]);

      while (tincture === base || fields.includes(tincture)) {tincture = rw(tinctures[type][element]);}

      if (type !== "patterns" && element !== "charge") tinctures.f.push(tincture); // add field tincture

      if (type === "patterns") {
        tinctures.pattern = tincture;
        tincture = definePattern(tincture, element);
      }

      return tincture;
    }

    function definePattern(pattern, element, size = "") {
      let t1 = null, t2 = null;
      if (P(.15)) size = "-small";
      else if (P(.05)) size = "-smaller";
      else if (P(.035)) size = "-big";
      else if (P(.001)) size = "-smallest";

      // apply standard tinctures
      if (P(.5) && ["vair", "vairInPale", "vairEnPointe"].includes(pattern)) {t1 = "azure"; t2 = "argent";}
      else if (P(.8) && pattern === "ermine") {t1 = "argent"; t2 = "sable";}
      else if (pattern === "pappellony") {
        if (P(.2)) {t1 = "gules"; t2 = "or";}
        else if (P(.2)) {t1 = "argent"; t2 = "sable";}
        else if (P(.2)) {t1 = "azure"; t2 = "argent";}
      }
      else if (pattern === "masoned") {
        if (P(.3)) {t1 = "gules"; t2 = "argent";}
        else if (P(.3)) {t1 = "argent"; t2 = "sable";}
        else if (P(.1)) {t1 = "or"; t2 = "sable";}
      }
      else if (pattern === "fretty") {
        if (t2 === "sable" || P(.35)) {t1 = "argent"; t2 = "gules";}
        else if (P(.25)) {t1 = "sable"; t2 = "or";}
        else if (P(.15)) {t1 = "gules"; t2 = "argent";}
      }
      else if (pattern === "semy") pattern += "_of_" + rw(charges[rw(charges.semy)]);

      if (!t1 || !t2) {
        const startWithMetal = P(.7);
        t1 = startWithMetal ? rw(tinctures.metals[element]) : rw(tinctures.colours[element]);
        t2 = startWithMetal ? rw(tinctures.colours[element]) : rw(tinctures.metals[element]);
      }

      // division should not be the same tincture as base field
      if (element === "division") {
        if (tinctures.f.includes(t1)) t1 = replaceTincture(t1);
        if (tinctures.f.includes(t2)) t2 = replaceTincture(t2);
      }

      tinctures.f.push(t1, t2);
      return `${pattern}-${t1}-${t2}${size}`;
    }

    function replaceTincture(t, n) {
      if (t === "or") return "argent";
      if (t === "argent") return "or";

      const type = getType(t);
      while (!n || n === t) {n = rw(tinctures[type].division);}
      return n;
    }

    function getType(t) {
      const tincture = t.includes("-") ? t.split("-")[1] : t;
      if (tincture === "argent" || tincture === "or") return "metals";
      return "colours";
    }

    /* src\Gallery.svelte generated by Svelte v3.29.4 */
    const file$e = "src\\Gallery.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (34:6) {#key coa}
    function create_key_block$1(ctx) {
    	let coa;
    	let current;

    	coa = new COA({
    			props: {
    				coa: /*coa*/ ctx[13],
    				i: /*i*/ ctx[15],
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
    			if (dirty & /*coas*/ 4) coa_changes.coa = /*coa*/ ctx[13];
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
    		id: create_key_block$1.name,
    		type: "key",
    		source: "(34:6) {#key coa}",
    		ctx
    	});

    	return block;
    }

    // (32:2) {#each coas as coa, i}
    function create_each_block$7(ctx) {
    	let div1;
    	let previous_key = /*coa*/ ctx[13];
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
    	let key_block = create_key_block$1(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*i*/ ctx[15], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[7](/*i*/ ctx[15], ...args);
    	}

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[8](/*i*/ ctx[15], ...args);
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
    			add_location(use0, file$e, 37, 44, 987);
    			attr_dev(svg0, "class", "svelte-1n7zkv2");
    			add_location(svg0, file$e, 37, 8, 951);
    			attr_dev(use1, "href", "#pencil-icon");
    			add_location(use1, file$e, 38, 41, 1065);
    			attr_dev(svg1, "class", "svelte-1n7zkv2");
    			add_location(svg1, file$e, 38, 8, 1032);
    			attr_dev(use2, "href", "#download-icon");
    			add_location(use2, file$e, 39, 42, 1146);
    			attr_dev(svg2, "class", "svelte-1n7zkv2");
    			add_location(svg2, file$e, 39, 8, 1112);
    			attr_dev(div0, "class", "control svelte-1n7zkv2");
    			add_location(div0, file$e, 36, 8, 920);
    			attr_dev(div1, "class", "svelte-1n7zkv2");
    			add_location(div1, file$e, 32, 4, 839);
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

    			if (dirty & /*coas*/ 4 && safe_not_equal(previous_key, previous_key = /*coa*/ ctx[13])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block$1(ctx);
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
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(32:2) {#each coas as coa, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let each_value = /*coas*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
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
    			set_style(div, "margin-top", "28px");
    			set_style(div, "font-size", Math.ceil(/*w*/ ctx[0] / 20) + "px");
    			attr_dev(div, "class", "svelte-1n7zkv2");
    			add_location(div, file$e, 30, 0, 716);
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
    			if (dirty & /*download, editCOA, regenerate, coas, w, h*/ 31) {
    				each_value = /*coas*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
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

    			if (!current || dirty & /*w*/ 1) {
    				set_style(div, "font-size", Math.ceil(/*w*/ ctx[0] / 20) + "px");
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $history;
    	let $matrix;
    	let $matrices;
    	let $state;
    	validate_store(history, "history");
    	component_subscribe($$self, history, $$value => $$invalidate(9, $history = $$value));
    	validate_store(matrix, "matrix");
    	component_subscribe($$self, matrix, $$value => $$invalidate(10, $matrix = $$value));
    	validate_store(matrices, "matrices");
    	component_subscribe($$self, matrices, $$value => $$invalidate(11, $matrices = $$value));
    	validate_store(state, "state");
    	component_subscribe($$self, state, $$value => $$invalidate(12, $state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Gallery", slots, []);
    	let { gallery } = $$props, { w } = $$props, { h } = $$props;

    	function regenerate(i) {
    		const coa = generate();
    		$$invalidate(5, gallery[i] = $history.length, gallery);
    		set_store_value(matrix, $matrix++, $matrix);
    		set_store_value(matrices, $matrices[$matrix] = gallery, $matrices);
    		$history.push(coa);
    		$$invalidate(2, coas[i] = coa, coas);
    	}

    	function editCOA(i) {
    		set_store_value(state, $state.edit = 1, $state);
    		set_store_value(state, $state.c = gallery[i], $state);
    		set_store_value(state, $state.i = i, $state);
    	}

    	const writable_props = ["gallery", "w", "h"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => regenerate(i);
    	const click_handler_1 = i => editCOA(i);
    	const click_handler_2 = i => download(i);

    	$$self.$$set = $$props => {
    		if ("gallery" in $$props) $$invalidate(5, gallery = $$props.gallery);
    		if ("w" in $$props) $$invalidate(0, w = $$props.w);
    		if ("h" in $$props) $$invalidate(1, h = $$props.h);
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
    		$history,
    		$matrix,
    		$matrices,
    		$state
    	});

    	$$self.$inject_state = $$props => {
    		if ("gallery" in $$props) $$invalidate(5, gallery = $$props.gallery);
    		if ("w" in $$props) $$invalidate(0, w = $$props.w);
    		if ("h" in $$props) $$invalidate(1, h = $$props.h);
    		if ("coas" in $$props) $$invalidate(2, coas = $$props.coas);
    	};

    	let coas;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*gallery, $history*/ 544) {
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
    		regenerate,
    		editCOA,
    		gallery,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { gallery: 5, w: 0, h: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*gallery*/ ctx[5] === undefined && !("gallery" in props)) {
    			console.warn("<Gallery> was created without expected prop 'gallery'");
    		}

    		if (/*w*/ ctx[0] === undefined && !("w" in props)) {
    			console.warn("<Gallery> was created without expected prop 'w'");
    		}

    		if (/*h*/ ctx[1] === undefined && !("h" in props)) {
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

    /* src\Patterns.svelte generated by Svelte v3.29.4 */
    const file$f = "src\\Patterns.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (145:32) 
    function create_if_block_16$1(ctx) {
    	let pattern;
    	let rect0;
    	let rect0_fill_value;
    	let rect1;
    	let rect1_fill_value;
    	let rect2;
    	let rect2_fill_value;
    	let rect3;
    	let rect3_fill_value;
    	let rect4;
    	let rect4_fill_value;
    	let line0;
    	let line1;
    	let line2;
    	let line3;
    	let line4;
    	let line5;
    	let line6;
    	let line7;
    	let line8;
    	let line9;
    	let line10;
    	let line11;
    	let line12;
    	let line13;
    	let line14;
    	let line15;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			rect3 = svg_element("rect");
    			rect4 = svg_element("rect");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			line3 = svg_element("line");
    			line4 = svg_element("line");
    			line5 = svg_element("line");
    			line6 = svg_element("line");
    			line7 = svg_element("line");
    			line8 = svg_element("line");
    			line9 = svg_element("line");
    			line10 = svg_element("line");
    			line11 = svg_element("line");
    			line12 = svg_element("line");
    			line13 = svg_element("line");
    			line14 = svg_element("line");
    			line15 = svg_element("line");
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "200");
    			attr_dev(rect0, "height", "200");
    			attr_dev(rect0, "stroke", "none");
    			attr_dev(rect0, "fill", rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect0, file$f, 146, 6, 8296);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "35");
    			attr_dev(rect1, "width", "200");
    			attr_dev(rect1, "height", "30");
    			attr_dev(rect1, "stroke", "none");
    			attr_dev(rect1, "fill", rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(rect1, file$f, 147, 6, 8375);
    			attr_dev(rect2, "x", "0");
    			attr_dev(rect2, "y", "135");
    			attr_dev(rect2, "width", "200");
    			attr_dev(rect2, "height", "30");
    			attr_dev(rect2, "stroke", "none");
    			attr_dev(rect2, "fill", rect2_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(rect2, file$f, 148, 6, 8454);
    			attr_dev(rect3, "x", "35");
    			attr_dev(rect3, "y", "0");
    			attr_dev(rect3, "width", "30");
    			attr_dev(rect3, "height", "200");
    			attr_dev(rect3, "stroke", "none");
    			attr_dev(rect3, "fill", rect3_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(rect3, file$f, 149, 6, 8534);
    			attr_dev(rect4, "x", "135");
    			attr_dev(rect4, "y", "0");
    			attr_dev(rect4, "width", "30");
    			attr_dev(rect4, "height", "200");
    			attr_dev(rect4, "stroke", "none");
    			attr_dev(rect4, "fill", rect4_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(rect4, file$f, 150, 6, 8613);
    			attr_dev(line0, "x1", "0");
    			attr_dev(line0, "y1", "35");
    			attr_dev(line0, "x2", "35");
    			attr_dev(line0, "y2", "35");
    			add_location(line0, file$f, 151, 6, 8693);
    			attr_dev(line1, "x1", "0");
    			attr_dev(line1, "y1", "65");
    			attr_dev(line1, "x2", "35");
    			attr_dev(line1, "y2", "65");
    			add_location(line1, file$f, 151, 37, 8724);
    			attr_dev(line2, "x1", "35");
    			attr_dev(line2, "y1", "165");
    			attr_dev(line2, "x2", "35");
    			attr_dev(line2, "y2", "200");
    			add_location(line2, file$f, 152, 6, 8763);
    			attr_dev(line3, "x1", "65");
    			attr_dev(line3, "y1", "165");
    			attr_dev(line3, "x2", "65");
    			attr_dev(line3, "y2", "200");
    			add_location(line3, file$f, 152, 40, 8797);
    			attr_dev(line4, "x1", "135");
    			attr_dev(line4, "y1", "0");
    			attr_dev(line4, "x2", "135");
    			attr_dev(line4, "y2", "35");
    			add_location(line4, file$f, 153, 6, 8839);
    			attr_dev(line5, "x1", "165");
    			attr_dev(line5, "y1", "0");
    			attr_dev(line5, "x2", "165");
    			attr_dev(line5, "y2", "35");
    			add_location(line5, file$f, 153, 39, 8872);
    			attr_dev(line6, "x1", "135");
    			attr_dev(line6, "y1", "65");
    			attr_dev(line6, "x2", "135");
    			attr_dev(line6, "y2", "200");
    			add_location(line6, file$f, 154, 6, 8913);
    			attr_dev(line7, "x1", "165");
    			attr_dev(line7, "y1", "65");
    			attr_dev(line7, "x2", "165");
    			attr_dev(line7, "y2", "200");
    			add_location(line7, file$f, 154, 41, 8948);
    			attr_dev(line8, "x1", "35");
    			attr_dev(line8, "y1", "0");
    			attr_dev(line8, "x2", "35");
    			attr_dev(line8, "y2", "135");
    			add_location(line8, file$f, 155, 6, 8991);
    			attr_dev(line9, "x1", "65");
    			attr_dev(line9, "y1", "0");
    			attr_dev(line9, "x2", "65");
    			attr_dev(line9, "y2", "135");
    			add_location(line9, file$f, 155, 38, 9023);
    			attr_dev(line10, "x1", "65");
    			attr_dev(line10, "y1", "35");
    			attr_dev(line10, "x2", "200");
    			attr_dev(line10, "y2", "35");
    			add_location(line10, file$f, 156, 6, 9063);
    			attr_dev(line11, "x1", "65");
    			attr_dev(line11, "y1", "65");
    			attr_dev(line11, "x2", "200");
    			attr_dev(line11, "y2", "65");
    			add_location(line11, file$f, 156, 39, 9096);
    			attr_dev(line12, "x1", "0");
    			attr_dev(line12, "y1", "135");
    			attr_dev(line12, "x2", "135");
    			attr_dev(line12, "y2", "135");
    			add_location(line12, file$f, 157, 6, 9137);
    			attr_dev(line13, "x1", "0");
    			attr_dev(line13, "y1", "165");
    			attr_dev(line13, "x2", "135");
    			attr_dev(line13, "y2", "165");
    			add_location(line13, file$f, 157, 40, 9171);
    			attr_dev(line14, "x1", "165");
    			attr_dev(line14, "y1", "135");
    			attr_dev(line14, "x2", "200");
    			attr_dev(line14, "y2", "135");
    			add_location(line14, file$f, 158, 6, 9213);
    			attr_dev(line15, "x1", "165");
    			attr_dev(line15, "y1", "165");
    			attr_dev(line15, "x2", "200");
    			attr_dev(line15, "y2", "165");
    			add_location(line15, file$f, 158, 42, 9249);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.28 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.28 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 200 200");
    			attr_dev(pattern, "patternTransform", "translate(-19,21) rotate(45)");
    			attr_dev(pattern, "stroke", "#000");
    			attr_dev(pattern, "stroke-width", "2");
    			add_location(pattern, file$f, 145, 4, 8129);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect0);
    			append_dev(pattern, rect1);
    			append_dev(pattern, rect2);
    			append_dev(pattern, rect3);
    			append_dev(pattern, rect4);
    			append_dev(pattern, line0);
    			append_dev(pattern, line1);
    			append_dev(pattern, line2);
    			append_dev(pattern, line3);
    			append_dev(pattern, line4);
    			append_dev(pattern, line5);
    			append_dev(pattern, line6);
    			append_dev(pattern, line7);
    			append_dev(pattern, line8);
    			append_dev(pattern, line9);
    			append_dev(pattern, line10);
    			append_dev(pattern, line11);
    			append_dev(pattern, line12);
    			append_dev(pattern, line13);
    			append_dev(pattern, line14);
    			append_dev(pattern, line15);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect0_fill_value !== (rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect0, "fill", rect0_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect1_fill_value !== (rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect2_fill_value !== (rect2_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect2, "fill", rect2_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect3_fill_value !== (rect3_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect3, "fill", rect3_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect4_fill_value !== (rect4_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect4, "fill", rect4_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.28 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.28 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16$1.name,
    		type: "if",
    		source: "(145:32) ",
    		ctx
    	});

    	return block;
    }

    // (139:33) 
    function create_if_block_15$1(ctx) {
    	let pattern;
    	let rect0;
    	let rect0_fill_value;
    	let rect1;
    	let rect1_stroke_value;
    	let line;
    	let line_stroke_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			line = svg_element("line");
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "100");
    			attr_dev(rect0, "height", "100");
    			attr_dev(rect0, "fill", rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect0, file$f, 140, 6, 7855);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "0");
    			attr_dev(rect1, "width", "100");
    			attr_dev(rect1, "height", "50");
    			attr_dev(rect1, "stroke", rect1_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			attr_dev(rect1, "stroke-width", "4");
    			add_location(rect1, file$f, 141, 6, 7920);
    			attr_dev(line, "x1", "50");
    			attr_dev(line, "y1", "50");
    			attr_dev(line, "x2", "50");
    			attr_dev(line, "y2", "100");
    			attr_dev(line, "stroke", line_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			attr_dev(line, "stroke-width", "5");
    			add_location(line, file$f, 142, 6, 8002);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 100 100");
    			attr_dev(pattern, "fill", "none");
    			add_location(pattern, file$f, 139, 4, 7751);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect0);
    			append_dev(pattern, rect1);
    			append_dev(pattern, line);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect0_fill_value !== (rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect0, "fill", rect0_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect1_stroke_value !== (rect1_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect1, "stroke", rect1_stroke_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && line_stroke_value !== (line_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(line, "stroke", line_stroke_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15$1.name,
    		type: "if",
    		source: "(139:33) ",
    		ctx
    	});

    	return block;
    }

    // (132:36) 
    function create_if_block_14$2(ctx) {
    	let pattern;
    	let rect;
    	let rect_fill_value;
    	let circle0;
    	let circle0_stroke_value;
    	let circle0_fill_value;
    	let circle1;
    	let circle1_stroke_value;
    	let circle1_fill_value;
    	let circle2;
    	let circle2_stroke_value;
    	let circle2_fill_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect = svg_element("rect");
    			circle0 = svg_element("circle");
    			circle1 = svg_element("circle");
    			circle2 = svg_element("circle");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "100");
    			attr_dev(rect, "height", "100");
    			attr_dev(rect, "fill", rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect, file$f, 133, 6, 7332);
    			attr_dev(circle0, "cx", "0");
    			attr_dev(circle0, "cy", "51");
    			attr_dev(circle0, "r", "45");
    			attr_dev(circle0, "stroke", circle0_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			attr_dev(circle0, "fill", circle0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			attr_dev(circle0, "stroke-width", "10");
    			add_location(circle0, file$f, 134, 6, 7397);
    			attr_dev(circle1, "cx", "100");
    			attr_dev(circle1, "cy", "51");
    			attr_dev(circle1, "r", "45");
    			attr_dev(circle1, "stroke", circle1_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			attr_dev(circle1, "fill", circle1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			attr_dev(circle1, "stroke-width", "10");
    			add_location(circle1, file$f, 135, 6, 7498);
    			attr_dev(circle2, "cx", "50");
    			attr_dev(circle2, "cy", "1");
    			attr_dev(circle2, "r", "45");
    			attr_dev(circle2, "stroke", circle2_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			attr_dev(circle2, "fill", circle2_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			attr_dev(circle2, "stroke-width", "10");
    			add_location(circle2, file$f, 136, 6, 7601);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 100 100");
    			add_location(pattern, file$f, 132, 4, 7240);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect);
    			append_dev(pattern, circle0);
    			append_dev(pattern, circle1);
    			append_dev(pattern, circle2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect_fill_value !== (rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && circle0_stroke_value !== (circle0_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(circle0, "stroke", circle0_stroke_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && circle0_fill_value !== (circle0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(circle0, "fill", circle0_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && circle1_stroke_value !== (circle1_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(circle1, "stroke", circle1_stroke_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && circle1_fill_value !== (circle1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(circle1, "fill", circle1_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && circle2_stroke_value !== (circle2_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(circle2, "stroke", circle2_stroke_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && circle2_fill_value !== (circle2_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(circle2, "fill", circle2_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14$2.name,
    		type: "if",
    		source: "(132:36) ",
    		ctx
    	});

    	return block;
    }

    // (127:35) 
    function create_if_block_13$3(ctx) {
    	let pattern;
    	let rect;
    	let rect_fill_value;
    	let polygon;
    	let polygon_fill_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect = svg_element("rect");
    			polygon = svg_element("polygon");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "50");
    			attr_dev(rect, "height", "100");
    			attr_dev(rect, "fill", rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect, file$f, 128, 6, 7053);
    			attr_dev(polygon, "points", "25,0 50,50 25,100 0,50");
    			attr_dev(polygon, "fill", polygon_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(polygon, file$f, 129, 6, 7117);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.25 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 50 100");
    			attr_dev(pattern, "patternTransform", "translate(22,44) rotate(-26.5)");
    			add_location(pattern, file$f, 127, 4, 6913);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect);
    			append_dev(pattern, polygon);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect_fill_value !== (rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && polygon_fill_value !== (polygon_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(polygon, "fill", polygon_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.25 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13$3.name,
    		type: "if",
    		source: "(127:35) ",
    		ctx
    	});

    	return block;
    }

    // (122:39) 
    function create_if_block_12$3(ctx) {
    	let pattern;
    	let rect;
    	let rect_fill_value;
    	let line;
    	let line_stroke_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect = svg_element("rect");
    			line = svg_element("line");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "50");
    			attr_dev(rect, "height", "50");
    			attr_dev(rect, "fill", rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(rect, file$f, 123, 6, 6717);
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "y1", "37.5");
    			attr_dev(line, "x2", "50");
    			attr_dev(line, "y2", "37.5");
    			attr_dev(line, "stroke", line_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			attr_dev(line, "stroke-width", "25");
    			add_location(line, file$f, 124, 6, 6780);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.36 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.36 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 50 50");
    			attr_dev(pattern, "patternTransform", "rotate(-45)");
    			add_location(pattern, file$f, 122, 4, 6598);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect);
    			append_dev(pattern, line);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect_fill_value !== (rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && line_stroke_value !== (line_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(line, "stroke", line_stroke_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.36 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.36 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$3.name,
    		type: "if",
    		source: "(122:39) ",
    		ctx
    	});

    	return block;
    }

    // (117:31) 
    function create_if_block_11$3(ctx) {
    	let pattern;
    	let rect;
    	let rect_fill_value;
    	let line;
    	let line_stroke_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect = svg_element("rect");
    			line = svg_element("line");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "50");
    			attr_dev(rect, "height", "50");
    			attr_dev(rect, "fill", rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(rect, file$f, 118, 6, 6398);
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "y1", "37.5");
    			attr_dev(line, "x2", "50");
    			attr_dev(line, "y2", "37.5");
    			attr_dev(line, "stroke", line_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			attr_dev(line, "stroke-width", "25");
    			add_location(line, file$f, 119, 6, 6461);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.36 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.36 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 50 50");
    			attr_dev(pattern, "patternTransform", "rotate(45)");
    			add_location(pattern, file$f, 117, 4, 6280);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect);
    			append_dev(pattern, line);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect_fill_value !== (rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && line_stroke_value !== (line_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(line, "stroke", line_stroke_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.36 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.36 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$3.name,
    		type: "if",
    		source: "(117:31) ",
    		ctx
    	});

    	return block;
    }

    // (111:34) 
    function create_if_block_10$3(ctx) {
    	let pattern;
    	let rect0;
    	let rect0_fill_value;
    	let rect1;
    	let rect1_fill_value;
    	let rect2;
    	let rect2_fill_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "25");
    			attr_dev(rect0, "height", "100");
    			attr_dev(rect0, "fill", rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(rect0, file$f, 112, 6, 6041);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "35");
    			attr_dev(rect1, "width", "25");
    			attr_dev(rect1, "height", "10");
    			attr_dev(rect1, "fill", rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect1, file$f, 113, 6, 6105);
    			attr_dev(rect2, "x", "0");
    			attr_dev(rect2, "y", "55");
    			attr_dev(rect2, "width", "25");
    			attr_dev(rect2, "height", "10");
    			attr_dev(rect2, "fill", rect2_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect2, file$f, 114, 6, 6169);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.5 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 25 100");
    			add_location(pattern, file$f, 111, 4, 5952);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect0);
    			append_dev(pattern, rect1);
    			append_dev(pattern, rect2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect0_fill_value !== (rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect0, "fill", rect0_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect1_fill_value !== (rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect2_fill_value !== (rect2_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect2, "fill", rect2_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.5 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$3.name,
    		type: "if",
    		source: "(111:34) ",
    		ctx
    	});

    	return block;
    }

    // (105:31) 
    function create_if_block_9$3(ctx) {
    	let pattern;
    	let rect0;
    	let rect0_fill_value;
    	let rect1;
    	let rect1_fill_value;
    	let rect2;
    	let rect2_fill_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "25");
    			attr_dev(rect0, "height", "100");
    			attr_dev(rect0, "fill", rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(rect0, file$f, 106, 6, 5710);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "25");
    			attr_dev(rect1, "width", "25");
    			attr_dev(rect1, "height", "25");
    			attr_dev(rect1, "fill", rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect1, file$f, 107, 6, 5774);
    			attr_dev(rect2, "x", "0");
    			attr_dev(rect2, "y", "75");
    			attr_dev(rect2, "width", "25");
    			attr_dev(rect2, "height", "25");
    			attr_dev(rect2, "fill", rect2_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect2, file$f, 108, 6, 5838);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.5 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 25 100");
    			add_location(pattern, file$f, 105, 4, 5621);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect0);
    			append_dev(pattern, rect1);
    			append_dev(pattern, rect2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect0_fill_value !== (rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect0, "fill", rect0_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect1_fill_value !== (rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect2_fill_value !== (rect2_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect2, "fill", rect2_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.5 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$3.name,
    		type: "if",
    		source: "(105:31) ",
    		ctx
    	});

    	return block;
    }

    // (99:31) 
    function create_if_block_8$3(ctx) {
    	let pattern;
    	let rect0;
    	let rect0_fill_value;
    	let rect1;
    	let rect1_fill_value;
    	let rect2;
    	let rect2_fill_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "100");
    			attr_dev(rect0, "height", "25");
    			attr_dev(rect0, "fill", rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect0, file$f, 100, 6, 5382);
    			attr_dev(rect1, "x", "25");
    			attr_dev(rect1, "y", "0");
    			attr_dev(rect1, "width", "25");
    			attr_dev(rect1, "height", "25");
    			attr_dev(rect1, "fill", rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(rect1, file$f, 101, 6, 5446);
    			attr_dev(rect2, "x", "75");
    			attr_dev(rect2, "y", "0");
    			attr_dev(rect2, "width", "25");
    			attr_dev(rect2, "height", "25");
    			attr_dev(rect2, "fill", rect2_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(rect2, file$f, 102, 6, 5510);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.5 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 100 25");
    			add_location(pattern, file$f, 99, 4, 5293);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect0);
    			append_dev(pattern, rect1);
    			append_dev(pattern, rect2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect0_fill_value !== (rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect0, "fill", rect0_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect1_fill_value !== (rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect2_fill_value !== (rect2_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect2, "fill", rect2_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.5 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$3.name,
    		type: "if",
    		source: "(99:31) ",
    		ctx
    	});

    	return block;
    }

    // (94:32) 
    function create_if_block_7$4(ctx) {
    	let pattern;
    	let rect;
    	let rect_fill_value;
    	let polygon;
    	let polygon_fill_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect = svg_element("rect");
    			polygon = svg_element("polygon");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "50");
    			attr_dev(rect, "height", "100");
    			attr_dev(rect, "fill", rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect, file$f, 95, 6, 5111);
    			attr_dev(polygon, "points", "25,0 50,50 25,100 0,50");
    			attr_dev(polygon, "fill", polygon_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(polygon, file$f, 96, 6, 5175);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.25 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 50 100");
    			add_location(pattern, file$f, 94, 4, 5021);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect);
    			append_dev(pattern, polygon);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect_fill_value !== (rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && polygon_fill_value !== (polygon_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(polygon, "fill", polygon_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.25 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$4.name,
    		type: "if",
    		source: "(94:32) ",
    		ctx
    	});

    	return block;
    }

    // (89:33) 
    function create_if_block_6$4(ctx) {
    	let pattern;
    	let rect;
    	let rect_fill_value;
    	let polygon;
    	let polygon_fill_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect = svg_element("rect");
    			polygon = svg_element("polygon");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "50");
    			attr_dev(rect, "height", "50");
    			attr_dev(rect, "fill", rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect, file$f, 90, 6, 4840);
    			attr_dev(polygon, "points", "25,0 50,25 25,50 0,25");
    			attr_dev(polygon, "fill", polygon_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(polygon, file$f, 91, 6, 4903);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 50 50");
    			add_location(pattern, file$f, 89, 4, 4750);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect);
    			append_dev(pattern, polygon);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect_fill_value !== (rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && polygon_fill_value !== (polygon_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(polygon, "fill", polygon_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$4.name,
    		type: "if",
    		source: "(89:33) ",
    		ctx
    	});

    	return block;
    }

    // (83:32) 
    function create_if_block_5$4(ctx) {
    	let pattern;
    	let rect0;
    	let rect1;
    	let rect1_fill_value;
    	let rect2;
    	let rect2_fill_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;
    	let pattern_fill_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "50");
    			attr_dev(rect0, "height", "50");
    			add_location(rect0, file$f, 84, 6, 4530);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "0");
    			attr_dev(rect1, "width", "25");
    			attr_dev(rect1, "height", "25");
    			attr_dev(rect1, "fill", rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect1, file$f, 85, 6, 4573);
    			attr_dev(rect2, "x", "25");
    			attr_dev(rect2, "y", "25");
    			attr_dev(rect2, "width", "25");
    			attr_dev(rect2, "height", "25");
    			attr_dev(rect2, "fill", rect2_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect2, file$f, 86, 6, 4636);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.25 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.25 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 50 50");
    			attr_dev(pattern, "fill", pattern_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(pattern, file$f, 83, 4, 4421);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect0);
    			append_dev(pattern, rect1);
    			append_dev(pattern, rect2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect1_fill_value !== (rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect2_fill_value !== (rect2_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect2, "fill", rect2_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.25 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.25 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && pattern_fill_value !== (pattern_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(pattern, "fill", pattern_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$4.name,
    		type: "if",
    		source: "(83:32) ",
    		ctx
    	});

    	return block;
    }

    // (71:32) 
    function create_if_block_4$4(ctx) {
    	let pattern;
    	let rect;
    	let rect_fill_value;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;
    	let pattern_fill_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect = svg_element("rect");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "25");
    			attr_dev(rect, "height", "25");
    			attr_dev(rect, "fill", rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect, file$f, 72, 6, 3146);
    			attr_dev(path0, "d", "m19.1,14.8 c-0.7,2.9 -2.1,5 -3.5,6.5 0.6,-0.1 1.3,-0.6 2,-0.9 -0.4,0.8 -0.8,1.4 -1.2,2.1 0.2,-0.1 1,-0.8 2,-1.8 0.2,1.4 0.4,2.9 0.7,3.9 0.3,-0.9 0.5,-2.5 0.7,-3.9 0.6,0.6 1.2,1.3 2.1,1.8 l -1.2,-2.2 c 0.6,0.3 1.3,0.8 1.9,1 -1.5,-1.6 -2.8,-3.6 -3.5,-6.5z");
    			add_location(path0, file$f, 73, 6, 3209);
    			attr_dev(path1, "d", "m16.1,14.9 c-0.1,-0.2 -1,0.4 -1.5,-0.8 1.2,1.1 2.5,-1.2 3.5,0.4 0.3,0.7 -1.1,1.8 -2,0.4z");
    			add_location(path1, file$f, 74, 6, 3482);
    			attr_dev(path2, "d", "m21.9,14.9 c.1,-.2 1,0.4 1.5,-0.8 -1.2,1.1 -2.5,-1.2 -3.5,0.4 -0.3,0.7 1.1,1.8 2,0.4z");
    			add_location(path2, file$f, 75, 6, 3590);
    			attr_dev(path3, "d", "m19.4,12.4 c-0.2,-0.1 0.7,-0.7 -0.6,-1.4 1.1,1.2 -2,1.7 -0.3,2.9 0.7,0.4 2.4,-0.5 0.9,-1.5z");
    			add_location(path3, file$f, 76, 6, 3695);
    			attr_dev(path4, "d", "M5.8,4.6 C5.1,7.5 3.7,9.5 2.3,11 2.9,10.9 3.6,10.5 4.2,10.1 3.8,10.9 3.4,11.5 3,12.2 3.3,12.1 4,11.4 5.1,10.4 c 0.2,1.4 0.4,2.9 0.7,3.9 0.3,-0.9 0.5,-2.5 0.7,-3.9 0.6,0.6 1.2,1.3 2.1,1.8 L 7.3,10 c 0.6,0.3 1.3,0.8 1.9,1 C7.7,9.5 6.4,7.5 5.8,4.6Z");
    			add_location(path4, file$f, 77, 6, 3806);
    			attr_dev(path5, "d", "M2.9,4.7 C2.8,4.6 1.9,5.1 1.3,4 2.6,5.1 3.8,2.8 4.9,4.3 5.2,5 3.8,6.1 2.9,4.7Z");
    			add_location(path5, file$f, 78, 6, 4071);
    			attr_dev(path6, "d", "M8.6,4.7 C8.7,4.5 9.6,5.1 10.1,3.9 8.9,5.1 7.6,2.7 6.6,4.3 6.3,5 7.7,6.1 8.6,4.7Z");
    			add_location(path6, file$f, 79, 6, 4169);
    			attr_dev(path7, "d", "M6.1,2.2 C 5.9,2.1 6.8,1.5 5.5,0.8 6.6,2.1 3.5,2.6 5.2,3.7 5.9,4.1 7.6,3.3 6.1,2.2Z");
    			add_location(path7, file$f, 80, 6, 4270);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 25 25");
    			attr_dev(pattern, "fill", pattern_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(pattern, file$f, 71, 4, 3035);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect);
    			append_dev(pattern, path0);
    			append_dev(pattern, path1);
    			append_dev(pattern, path2);
    			append_dev(pattern, path3);
    			append_dev(pattern, path4);
    			append_dev(pattern, path5);
    			append_dev(pattern, path6);
    			append_dev(pattern, path7);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect_fill_value !== (rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && pattern_fill_value !== (pattern_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(pattern, "fill", pattern_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$4.name,
    		type: "if",
    		source: "(71:32) ",
    		ctx
    	});

    	return block;
    }

    // (64:38) 
    function create_if_block_3$4(ctx) {
    	let pattern;
    	let rect0;
    	let rect0_fill_value;
    	let path0;
    	let path0_fill_value;
    	let rect1;
    	let rect1_fill_value;
    	let rect1_stroke_value;
    	let path1;
    	let path1_fill_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect0 = svg_element("rect");
    			path0 = svg_element("path");
    			rect1 = svg_element("rect");
    			path1 = svg_element("path");
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "25");
    			attr_dev(rect0, "height", "25");
    			attr_dev(rect0, "fill", rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(rect0, file$f, 65, 6, 2617);
    			attr_dev(path0, "d", "m12.5,0 l6.25,6.25 v12.5 l6.25,6.25 h-25 l6.25,-6.25 v-12.5 z");
    			attr_dev(path0, "fill", path0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(path0, file$f, 66, 6, 2680);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "25");
    			attr_dev(rect1, "width", "25");
    			attr_dev(rect1, "height", "25");
    			attr_dev(rect1, "fill", rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			attr_dev(rect1, "stroke-width", "1");
    			attr_dev(rect1, "stroke", rect1_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(rect1, file$f, 67, 6, 2782);
    			attr_dev(path1, "d", "m12.5,25 l6.25,6.25 v12.5 l6.25,6.25 h-25 l6.25,-6.25 v-12.5 z");
    			attr_dev(path1, "fill", path1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(path1, file$f, 68, 6, 2884);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.25 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 25 50");
    			add_location(pattern, file$f, 64, 4, 2528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect0);
    			append_dev(pattern, path0);
    			append_dev(pattern, rect1);
    			append_dev(pattern, path1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect0_fill_value !== (rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect0, "fill", rect0_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && path0_fill_value !== (path0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(path0, "fill", path0_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect1_fill_value !== (rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect1_stroke_value !== (rect1_stroke_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect1, "stroke", rect1_stroke_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && path1_fill_value !== (path1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(path1, "fill", path1_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.25 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(64:38) ",
    		ctx
    	});

    	return block;
    }

    // (59:36) 
    function create_if_block_2$4(ctx) {
    	let pattern;
    	let rect;
    	let rect_fill_value;
    	let path;
    	let path_fill_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect = svg_element("rect");
    			path = svg_element("path");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "200");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(rect, file$f, 60, 6, 2275);
    			attr_dev(path, "d", "m12.5,0 l6.25,6.25 v12.5 l6.25,6.25 h-25 l6.25,-6.25 v-12.5 z");
    			attr_dev(path, "fill", path_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			attr_dev(path, "stroke", "#000");
    			attr_dev(path, "stroke-width", ".2");
    			add_location(path, file$f, 61, 6, 2340);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 25 25");
    			add_location(pattern, file$f, 59, 4, 2185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect);
    			append_dev(pattern, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect_fill_value !== (rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && path_fill_value !== (path_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(path, "fill", path_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(59:36) ",
    		ctx
    	});

    	return block;
    }

    // (52:30) 
    function create_if_block_1$5(ctx) {
    	let pattern;
    	let rect0;
    	let rect0_fill_value;
    	let path0;
    	let path0_fill_value;
    	let rect1;
    	let rect1_fill_value;
    	let path1;
    	let path1_fill_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect0 = svg_element("rect");
    			path0 = svg_element("path");
    			rect1 = svg_element("rect");
    			path1 = svg_element("path");
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "25");
    			attr_dev(rect0, "height", "25");
    			attr_dev(rect0, "fill", rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			attr_dev(rect0, "stroke", "none");
    			add_location(rect0, file$f, 53, 6, 1749);
    			attr_dev(path0, "d", "m12.5,0 l6.25,6.25 v12.5 l6.25,6.25 h-25 l6.25,-6.25 v-12.5 z");
    			attr_dev(path0, "fill", path0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			add_location(path0, file$f, 54, 6, 1826);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "25");
    			attr_dev(rect1, "width", "25");
    			attr_dev(rect1, "height", "25");
    			attr_dev(rect1, "fill", rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			attr_dev(rect1, "stroke-width", "1");
    			attr_dev(rect1, "stroke", "none");
    			add_location(rect1, file$f, 55, 6, 1928);
    			attr_dev(path1, "d", "m25,25 l-6.25,6.25 v12.5 l-6.25,6.25 l-6.25,-6.25 v-12.5 l-6.25,-6.25 z");
    			attr_dev(path1, "fill", path1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(path1, file$f, 56, 6, 2021);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.125 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.25 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 25 50");
    			attr_dev(pattern, "stroke", "#000");
    			attr_dev(pattern, "stroke-width", ".2");
    			add_location(pattern, file$f, 52, 4, 1630);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect0);
    			append_dev(pattern, path0);
    			append_dev(pattern, rect1);
    			append_dev(pattern, path1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$colors, patternData*/ 3 && rect0_fill_value !== (rect0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(rect0, "fill", rect0_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && path0_fill_value !== (path0_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(path0, "fill", path0_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && rect1_fill_value !== (rect1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && path1_fill_value !== (path1_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(path1, "fill", path1_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.125 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.25 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(52:30) ",
    		ctx
    	});

    	return block;
    }

    // (42:2) {#if p.type === "semy"}
    function create_if_block$8(ctx) {
    	let pattern;
    	let rect;
    	let rect_fill_value;
    	let g;
    	let promise;
    	let g_fill_value;
    	let pattern_id_value;
    	let pattern_width_value;
    	let pattern_height_value;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 8
    	};

    	handle_promise(promise = /*getCharge*/ ctx[2](/*p*/ ctx[5]), info);

    	const block = {
    		c: function create() {
    			pattern = svg_element("pattern");
    			rect = svg_element("rect");
    			g = svg_element("g");
    			info.block.c();
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "150");
    			attr_dev(rect, "height", "200");
    			attr_dev(rect, "fill", rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1]);
    			attr_dev(rect, "stroke", "none");
    			add_location(rect, file$f, 43, 4, 1288);
    			attr_dev(g, "fill", g_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2]);
    			add_location(g, file$f, 44, 4, 1365);
    			attr_dev(pattern, "id", pattern_id_value = /*p*/ ctx[5].id);
    			attr_dev(pattern, "width", pattern_width_value = 0.134 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "height", pattern_height_value = 0.1787 * /*p*/ ctx[5].mod);
    			attr_dev(pattern, "viewBox", "0 0 150 200");
    			attr_dev(pattern, "stroke", "#000");
    			add_location(pattern, file$f, 42, 2, 1183);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pattern, anchor);
    			append_dev(pattern, rect);
    			append_dev(pattern, g);
    			info.block.m(g, info.anchor = null);
    			info.mount = () => g;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$colors, patternData*/ 3 && rect_fill_value !== (rect_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t1])) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			info.ctx = ctx;

    			if (dirty & /*patternData*/ 1 && promise !== (promise = /*getCharge*/ ctx[2](/*p*/ ctx[5])) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[8] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (dirty & /*$colors, patternData*/ 3 && g_fill_value !== (g_fill_value = /*$colors*/ ctx[1][/*p*/ ctx[5].t2])) {
    				attr_dev(g, "fill", g_fill_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_id_value !== (pattern_id_value = /*p*/ ctx[5].id)) {
    				attr_dev(pattern, "id", pattern_id_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_width_value !== (pattern_width_value = 0.134 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "width", pattern_width_value);
    			}

    			if (dirty & /*patternData*/ 1 && pattern_height_value !== (pattern_height_value = 0.1787 * /*p*/ ctx[5].mod)) {
    				attr_dev(pattern, "height", pattern_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pattern);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(42:2) {#if p.type === \\\"semy\\\"}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>    import {colors, patterns}
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>    import {colors, patterns}",
    		ctx
    	});

    	return block;
    }

    // (46:39)           <g transform="translate(-60,-50)">{@html charge}
    function create_then_block(ctx) {
    	let g0;
    	let raw0_value = /*charge*/ ctx[8] + "";
    	let g1;
    	let raw1_value = /*charge*/ ctx[8] + "";

    	const block = {
    		c: function create() {
    			g0 = svg_element("g");
    			g1 = svg_element("g");
    			attr_dev(g0, "transform", "translate(-60,-50)");
    			add_location(g0, file$f, 46, 8, 1440);
    			attr_dev(g1, "transform", "translate(10,50)");
    			add_location(g1, file$f, 47, 8, 1502);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g0, anchor);
    			g0.innerHTML = raw0_value;
    			insert_dev(target, g1, anchor);
    			g1.innerHTML = raw1_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*patternData*/ 1 && raw0_value !== (raw0_value = /*charge*/ ctx[8] + "")) g0.innerHTML = raw0_value;			if (dirty & /*patternData*/ 1 && raw1_value !== (raw1_value = /*charge*/ ctx[8] + "")) g1.innerHTML = raw1_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g0);
    			if (detaching) detach_dev(g1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(46:39)           <g transform=\\\"translate(-60,-50)\\\">{@html charge}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>    import {colors, patterns}
    function create_pending_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>    import {colors, patterns}",
    		ctx
    	});

    	return block;
    }

    // (41:0) {#each patternData as p}
    function create_each_block$8(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*p*/ ctx[5].type === "semy") return create_if_block$8;
    		if (/*p*/ ctx[5].type === "vair") return create_if_block_1$5;
    		if (/*p*/ ctx[5].type === "vairInPale") return create_if_block_2$4;
    		if (/*p*/ ctx[5].type === "vairEnPointe") return create_if_block_3$4;
    		if (/*p*/ ctx[5].type === "ermine") return create_if_block_4$4;
    		if (/*p*/ ctx[5].type === "chequy") return create_if_block_5$4;
    		if (/*p*/ ctx[5].type === "lozengy") return create_if_block_6$4;
    		if (/*p*/ ctx[5].type === "fusily") return create_if_block_7$4;
    		if (/*p*/ ctx[5].type === "pally") return create_if_block_8$3;
    		if (/*p*/ ctx[5].type === "barry") return create_if_block_9$3;
    		if (/*p*/ ctx[5].type === "gemelles") return create_if_block_10$3;
    		if (/*p*/ ctx[5].type === "bendy") return create_if_block_11$3;
    		if (/*p*/ ctx[5].type === "bendySinister") return create_if_block_12$3;
    		if (/*p*/ ctx[5].type === "palyBendy") return create_if_block_13$3;
    		if (/*p*/ ctx[5].type === "pappellony") return create_if_block_14$2;
    		if (/*p*/ ctx[5].type === "masoned") return create_if_block_15$1;
    		if (/*p*/ ctx[5].type === "fretty") return create_if_block_16$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(41:0) {#each patternData as p}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let each_1_anchor;
    	let each_value = /*patternData*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
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
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*patternData, $colors, getCharge*/ 7) {
    				each_value = /*patternData*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
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

    function getSizeModified(size) {
    	if (size === "small") return 0.5;
    	if (size === "smaller") return 0.25;
    	if (size === "smallest") return 0.125;
    	if (size === "big") return 2;
    	return 1;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $patterns;
    	let $colors;
    	validate_store(patterns, "patterns");
    	component_subscribe($$self, patterns, $$value => $$invalidate(3, $patterns = $$value));
    	validate_store(colors, "colors");
    	component_subscribe($$self, colors, $$value => $$invalidate(1, $colors = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Patterns", slots, []);
    	let patternData = [];
    	const defs = document.getElementById("charges");

    	async function getCharge(p) {
    		let html = "";
    		const internal = defs.querySelector("#" + p.charge);

    		if (internal) {
    			html = internal.outerHTML;
    		} else {
    			const extSVG = await fetch("charges/" + p.charge + ".svg");
    			const text = await extSVG.text();
    			const el = document.createElement("html");
    			el.innerHTML = text;
    			html = el.querySelector("g").outerHTML;
    			defs.insertAdjacentHTML("beforeend", html);
    		}

    		return html;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Patterns> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		colors,
    		patterns,
    		patternData,
    		getSizeModified,
    		defs,
    		getCharge,
    		$patterns,
    		$colors
    	});

    	$$self.$inject_state = $$props => {
    		if ("patternData" in $$props) $$invalidate(0, patternData = $$props.patternData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$patterns*/ 8) {
    			 {
    				$$invalidate(0, patternData = [...new Set($patterns)].map(id => {
    					const [element, t1, t2, size] = id.split("-");
    					const [type, charge] = element.split("_of_");
    					const mod = getSizeModified(size);
    					return { id, type, t1, t2, mod, charge };
    				}));
    			}
    		}
    	};

    	return [patternData, $colors, getCharge];
    }

    class Patterns extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Patterns",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.29.4 */

    const { console: console_1$2 } = globals;

    const file$g = "src\\App.svelte";

    // (58:2) {#if $state.about}
    function create_if_block_1$6(ctx) {
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
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(58:2) {#if $state.about}",
    		ctx
    	});

    	return block;
    }

    // (60:2) {:else}
    function create_else_block$3(ctx) {
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
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(60:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (59:2) {#if $state.edit}
    function create_if_block$9(ctx) {
    	let editor;
    	let current;

    	editor = new Editor({
    			props: {
    				coa: /*coa*/ ctx[3],
    				c: /*$state*/ ctx[4].c
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
    			if (dirty & /*coa*/ 8) editor_changes.coa = /*coa*/ ctx[3];
    			if (dirty & /*$state*/ 16) editor_changes.c = /*$state*/ ctx[4].c;
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
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(59:2) {#if $state.edit}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let main;
    	let navbar;
    	let t0;
    	let t1;
    	let current_block_type_index;
    	let if_block1;
    	let t2;
    	let div;
    	let svg;
    	let defs;
    	let patterns;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	let if_block0 = /*$state*/ ctx[4].about && create_if_block_1$6(ctx);
    	const if_block_creators = [create_if_block$9, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$state*/ ctx[4].edit) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	patterns = new Patterns({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if_block1.c();
    			t2 = space();
    			div = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			create_component(patterns.$$.fragment);
    			add_location(defs, file$g, 62, 6, 2068);
    			attr_dev(svg, "width", "0");
    			attr_dev(svg, "height", "0");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$g, 61, 4, 2004);
    			attr_dev(div, "id", "patterns");
    			set_style(div, "position", "absolute");
    			add_location(div, file$g, 60, 2, 1953);
    			set_style(main, "background-color", /*$background*/ ctx[5]);
    			attr_dev(main, "class", "svelte-32wlsa");
    			add_location(main, file$g, 55, 0, 1767);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t0);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t1);
    			if_blocks[current_block_type_index].m(main, null);
    			append_dev(main, t2);
    			append_dev(main, div);
    			append_dev(div, svg);
    			append_dev(svg, defs);
    			mount_component(patterns, defs, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$state*/ ctx[4].about) {
    				if (if_block0) {
    					if (dirty & /*$state*/ 16) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$6(ctx);
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
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(main, t2);
    			}

    			if (!current || dirty & /*$background*/ 32) {
    				set_style(main, "background-color", /*$background*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(patterns.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(patterns.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    			destroy_component(patterns);
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
    	let $size;
    	let $history;
    	let $matrices;
    	let $matrix;
    	let $state;
    	let $background;
    	validate_store(size, "size");
    	component_subscribe($$self, size, $$value => $$invalidate(7, $size = $$value));
    	validate_store(history, "history");
    	component_subscribe($$self, history, $$value => $$invalidate(8, $history = $$value));
    	validate_store(matrices, "matrices");
    	component_subscribe($$self, matrices, $$value => $$invalidate(9, $matrices = $$value));
    	validate_store(matrix, "matrix");
    	component_subscribe($$self, matrix, $$value => $$invalidate(10, $matrix = $$value));
    	validate_store(state, "state");
    	component_subscribe($$self, state, $$value => $$invalidate(4, $state = $$value));
    	validate_store(background, "background");
    	component_subscribe($$self, background, $$value => $$invalidate(5, $background = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let n, w, h, gallery = [], coa;
    	

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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navbar,
    		About,
    		Editor,
    		Gallery,
    		Patterns,
    		generate,
    		background,
    		size,
    		history,
    		matrices,
    		matrix,
    		state,
    		changes,
    		n,
    		w,
    		h,
    		gallery,
    		coa,
    		defineGallerySize,
    		$size,
    		$history,
    		$matrices,
    		$matrix,
    		$state,
    		$background
    	});

    	$$self.$inject_state = $$props => {
    		if ("n" in $$props) $$invalidate(6, n = $$props.n);
    		if ("w" in $$props) $$invalidate(0, w = $$props.w);
    		if ("h" in $$props) $$invalidate(1, h = $$props.h);
    		if ("gallery" in $$props) $$invalidate(2, gallery = $$props.gallery);
    		if ("coa" in $$props) $$invalidate(3, coa = $$props.coa);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$size*/ 128) {
    			 $$invalidate(6, [n, w, h] = defineGallerySize($size), n, ($$invalidate(0, w), $$invalidate(7, $size)), ($$invalidate(1, h), $$invalidate(7, $size)));
    		}

    		if ($$self.$$.dirty & /*$history, $matrices, $matrix, $state, n, coa*/ 1880) {
    			 {
    				const l = $history.length;

    				// reroll is clicked
    				if (!$matrices[$matrix]) {
    					if ($state.edit) {
    						// generate new coa
    						set_store_value(matrices, $matrices[$matrix] = $matrices[$matrix - 1].slice(), $matrices);

    						set_store_value(matrices, $matrices[$matrix][$state.i] = l, $matrices);
    					} else {
    						// reroll gallery
    						set_store_value(matrices, $matrices[$matrix] = Array.from({ length: n }, (_, i) => l + i++), $matrices);
    					}
    				}

    				// update if of edited coa
    				if ($state.edit) {
    					set_store_value(state, $state.c = $matrices[$matrix][$state.i], $state);
    					$$invalidate(3, coa = $history[$state.c] || generate());
    					if (!$history[$state.c]) $history.push(coa);
    					changes.reset();
    				}

    				// add additional coas to matrix if size is smaller
    				if ($matrices[$matrix].length < n) {
    					const m = $matrices[$matrix];
    					set_store_value(matrices, $matrices[$matrix] = [...Array(n).keys()].map(i => m[i] || l + i), $matrices);
    				}

    				$$invalidate(2, gallery = $matrices[$matrix].slice(0, n));
    				console.log(`matrix update ${$matrix}: ${$matrices[$matrix]}`);
    			}
    		}
    	};

    	return [w, h, gallery, coa, $state, $background];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
