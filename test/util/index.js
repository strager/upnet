function test() {
    require('./baseenc').test();
    require('./hash').test();
    require('./match').test();
}

require('../runner').run(test, module);
