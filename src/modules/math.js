import sassport from '../index.js';

const mathModule = sassport.module('math')
  .functions({
    'Math($method, $args...)': sassport.wrapAll(Math)
  });

export default mathModule;