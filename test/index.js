function test() {
    require('./util').test();
}

require('./runner').run(test, module);
