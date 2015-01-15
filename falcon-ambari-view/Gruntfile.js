(function () {
  "use strict";

  module.exports = function (grunt) {

    grunt.initConfig({

      scp: {
        options: {
          host: '127.0.0.1',
          username: 'root',
          password: 'hadoop',
          port: 2222
        },

        sandbox: {
          files: [
            {
              cwd: 'target',
              src: '*.jar',
              filter: 'isFile',
              // path on the server
              dest: '/var/lib/ambari-server/resources/views'
            }
          ]
        }
      }

    });

    grunt.registerTask('deploy', [
      'scp'
    ]);
    
    grunt.loadNpmTasks('grunt-scp');

  };

}());