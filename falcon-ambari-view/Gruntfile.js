(function () {
  "use strict";

  module.exports = function (grunt) {

    grunt.initConfig({

      scp: {
        options: {
          host: 'sandbox.hortonworks.com',
          username: 'root',
          password: 'hadoop'
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