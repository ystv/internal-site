@Library('ystv-jenkins')

def imageTag = ''
pipeline {
  agent {
    label 'docker'
  }

  environment {
    DOCKER_BUILDKIT = "1"
  }

  stages {
    stage('Prepare') {
      steps {
        ciSkip action: 'check'
        script {
          def imageNamePrefix = ''
          if (env.BRANCH_NAME != 'main') {
            imageNamePrefix = "${env.BRANCH_NAME}-"
          }
          imageTag = "${imageNamePrefix}${env.BUILD_NUMBER}"
        }
      }
    }
    stage('Build Images') {
      environment {
        SENTRY_AUTH_TOKEN = credentials('calendar-sentry-auth-token')
      }
      steps {
        sh """docker build \\
          --build-arg GIT_REV=${env.GIT_COMMIT} \\
          --build-arg VERSION=${env.TAG_NAME ?: 'v0.0.0'} \\
          --build-arg SENTRY_AUTH_TOKEN=\$SENTRY_AUTH_TOKEN \\
          -t registry.comp.ystv.co.uk/ystv/calendar2023:${imageTag}\\
          .
        """
      }
    }

    stage('Push') {
      when {
        anyOf {
          branch 'main'
          tag 'v*'
          changeRequest target: 'main'
        }
      }
      steps {
        dockerPush image: 'registry.comp.ystv.co.uk/ystv/calendar2023', tag: imageTag
      }
    }

    stage('Deploy preview') {
      when {
        changeRequest target: 'main'
      }
      steps {
        deployPreview action: 'deploy', job: 'calendar-preview', urlSuffix: 'internal.dev.ystv.co.uk'
      }
    }

    stage('Deploy to development') {
      when {
        branch 'main'
      }
      steps {
        build job: 'Deploy Nomad Job', parameters: [
          string(name: 'JOB_FILE', value: 'calendar-dev.nomad'),
          text(name: 'TAG_REPLACEMENTS', value: "registry.comp.ystv.co.uk/ystv/calendar2023:${imageTag}")
        ], wait: true
        deployPreview action: 'cleanup'
      }
    }

    stage('Deploy to production') {
      when {
        // Only build tags that look like v1.2.3 with no suffix (eg v1.2.3-beta.1 won't be built)
        tag(pattern: /^v\d+\.\d+\.\d+$/, comparator: "REGEXP")
      }
      steps {
        build job: 'Deploy Nomad Job', parameters: [
          string(name: 'JOB_FILE', value: 'calendar-prod.nomad'),
          text(name: 'TAG_REPLACEMENTS', value: "registry.comp.ystv.co.uk/ystv/calendar2023:${imageTag}")
        ]
      }
    }
  }

  post {
    always {
      ciSkip action: 'postProcess'
      cleanWs()
    }
  }
}
