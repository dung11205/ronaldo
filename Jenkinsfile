pipeline {
    agent any

    stages {

        // 1. LẤY CODE TỪ GITHUB
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // 2. KIỂM TRA CODE
        stage('Test') {
            steps {
                echo 'GitHub connection OK!'

                sh '''
                    echo "===== FILES IN PROJECT ====="
                    ls -la
                    echo "============================"
                '''
            }
        }

        // 3. KIỂM TRA TELEGRAM
        stage('Test Telegram') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'telegram-bot-token',
                        variable: 'BOT_TOKEN'
                    ),
                    string(
                        credentialsId: 'telegram-chat-id',
                        variable: 'CHAT_ID'
                    )
                ]) {

                    sh '''
                        echo "Checking Telegram configuration..."

                        TOKEN_LENGTH=$(printf '%s' "$BOT_TOKEN" | wc -c)
                        COLON_COUNT=$(printf '%s' "$BOT_TOKEN" | tr -cd ':' | wc -c)

                        echo "Token length: $TOKEN_LENGTH"
                        echo "Colon count: $COLON_COUNT"

                        if [ "$TOKEN_LENGTH" -lt 20 ]; then
                            echo "ERROR: Telegram Bot Token appears invalid."
                            exit 1
                        fi

                        if [ "$COLON_COUNT" -ne 1 ]; then
                            echo "ERROR: Telegram Bot Token format is invalid."
                            exit 1
                        fi

                        echo "Telegram configuration format OK."
                    '''
                }
            }
        }

        // 4. KIỂM TRA WEBSITE VERCEL
        stage('Test Vercel Website') {
            steps {
                sh '''
                    echo "Checking Vercel website..."

                    URL="https://ronaldo-zeta.vercel.app/"

                    HTTP_STATUS=$(curl -L -s -o /dev/null -w "%{http_code}" "$URL")

                    echo "Website: $URL"
                    echo "HTTP Status: $HTTP_STATUS"

                    if [ "$HTTP_STATUS" -ne 200 ]; then
                        echo "ERROR: Vercel website is not responding correctly."
                        exit 1
                    fi

                    echo "Vercel website is running successfully."
                '''
            }
        }
    }

    // GỬI TELEGRAM SAU BUILD
    post {

        // BUILD THÀNH CÔNG
        success {
            withCredentials([
                string(
                    credentialsId: 'telegram-bot-token',
                    variable: 'BOT_TOKEN'
                ),
                string(
                    credentialsId: 'telegram-chat-id',
                    variable: 'CHAT_ID'
                )
            ]) {

                sh '''
                    echo "Sending SUCCESS notification to Telegram..."

                    curl -sS --fail \
                        --request POST \
                        --url "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                        --data-urlencode "chat_id=${CHAT_ID}" \
                        --data-urlencode "text=Jenkins SUCCESS - ${JOB_NAME} #${BUILD_NUMBER} - Vercel OK"

                    echo "Telegram SUCCESS notification sent."
                '''
            }
        }

        // BUILD THẤT BẠI
        failure {
            withCredentials([
                string(
                    credentialsId: 'telegram-bot-token',
                    variable: 'BOT_TOKEN'
                ),
                string(
                    credentialsId: 'telegram-chat-id',
                    variable: 'CHAT_ID'
                )
            ]) {

                sh '''
                    echo "Sending FAILURE notification to Telegram..."

                    curl -sS --fail \
                        --request POST \
                        --url "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                        --data-urlencode "chat_id=${CHAT_ID}" \
                        --data-urlencode "text=Jenkins FAILED - ${JOB_NAME} #${BUILD_NUMBER}"

                    echo "Telegram FAILURE notification sent."
                '''
            }
        }
    }
}