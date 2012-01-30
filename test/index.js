function test() {
    require('./util').test();
    require('./smokeTest').test();
}

require('./runner').run(test, module);
