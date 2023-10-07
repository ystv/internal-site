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
      steps {
        withDockerRegistry(credentialsId: 'docker-registry', url: 'https://registry.comp.ystv.co.uk') {
          sh "docker push registry.comp.ystv.co.uk/ystv/calendar2023:${imageTag}"
          script {
            if (env.BRANCH_NAME == 'master') {
              sh "docker tag registry.comp.ystv.co.uk/ystv/calendar2023:${imageTag} registry.comp.ystv.co.uk/ystv/calendar2023:latest"
              sh 'docker push registry.comp.ystv.co.uk/ystv/calendar2023:latest'
            }
          }
        }
      }
    }

    stage('Deploy to development') {
      when {
        branch 'master'
      }
      steps {
        build job: 'Deploy Nomad Job', parameters: [
          string(name: 'JOB_FILE', value: 'calendar-dev.nomad'),
          text(name: 'TAG_REPLACEMENTS', value: "registry.comp.ystv.co.uk/ystv/calendar2023:${imageTag}")
        ]
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