function LoadSequence(options) {
    function deleteScriptElement(script) {
        if( script ) {
            script.onreadystatechange = null;
            script.onload = null;
            document.documentElement.removeChild( script );
            script = null;
        }
    }

    function loadScript(url, callback) {
        var script = document.createElement("script");
        script.setAttribute('type', "text/javascript");
        script.onreadystatechange = function () {
            if (this.readyState == 'loaded') {
                deleteScriptElement(script);
                callback();
            }
        }
        script.onload = function() {
            deleteScriptElement(script);
            callback();
        };
        script.src = url;
        document.documentElement.appendChild(script);
    }

    function dependencySequenceResolver(graph, callback) {
        var sorted = [],
            index = {},
            queue = [],
            count = 0;

        var asset;
        for(asset in graph.assets)  {
            index[asset] = 0;
            count++;
        }

        function buildIndex(g) {
            var i,name;
            for(name in g.deps) {
                var deps = g.deps[name];
                for(i = 0; i < deps.length; i++) index[deps[i]] += 1;
            }
        }

        function findZero() {
            var name;
            for(name in index) {
                if(index[name] === 0) {
                    delete index[name];
                    count--;
                    queue.push(name);
                }
            }
        }

        function update(g) {
            findZero();
            while(queue.length > 0) {
                var name = queue.shift();
                var deps = g.deps[name];
                for(var i = 0; i< deps.length; i++) {
                    index[deps[i]]--;
                }
                sorted.push(name);
            }
            if(count === 0) {
                callback(sorted);
            } else {
                setTimeout(function(){
                    update(g);
                }, 13);
            }
        }

        buildIndex(graph);
        update(graph);
    }

    function load(seq) {
        var item = seq.pop();
        if(item) {
            loadScript(options.assets[item], function() {
                load(seq);
            });
        } else {
            if(options.done) options.done();
        }
    }

    dependencySequenceResolver(options, load);
}