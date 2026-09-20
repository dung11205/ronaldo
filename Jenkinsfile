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
    }

    post {
        success {
            withCredentials([
                string(credentialsId: 'telegram-bot-token', variable: 'BOT_TOKEN'),
                string(credentialsId: 'telegram-chat-id', variable: 'CHAT_ID')
            ]) {
                sh '''
                    curl -sS -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                    --data-urlencode "chat_id=${CHAT_ID}" \
                    --data-urlencode "text=✅ Jenkins SUCCESS - ${JOB_NAME} #${BUILD_NUMBER}"
                '''
            }
        }

        failure {
            withCredentials([
                string(credentialsId: 'telegram-bot-token', variable: 'BOT_TOKEN'),
                string(credentialsId: 'telegram-chat-id', variable: 'CHAT_ID')
            ]) {
                sh '''
                    curl -sS -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                    --data-urlencode "chat_id=${CHAT_ID}" \
                    --data-urlencode "text=❌ Jenkins FAILED - ${JOB_NAME} #${BUILD_NUMBER}"
                '''
            }
        }
    }
}
