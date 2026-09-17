pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test') {
            steps {
                echo 'GitHub connection OK!'
                sh 'ls -la'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying website...'
                sh 'docker rm -f ronaldo-web || true'
                sh 'docker run -d --name ronaldo-web -p 8081:80 -v "$PWD":/usr/share/nginx/html nginx:alpine'
                echo 'Deploy SUCCESS to http://localhost:8081'
            }
        }
    }
}
