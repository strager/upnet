function test() {
    require('./baseenc').test();
    require('./match').test();
}

require('../runner').run(test, module);
