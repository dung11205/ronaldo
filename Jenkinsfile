pipeline {
    agent any

    environment {
        VERCEL_URL = 'https://ronaldo-zeta.vercel.app/'
    }

    stages {

        // 1. LẤY CODE TỪ GITHUB
        stage('Checkout') {
            steps {
                checkout scm

                script {
                    env.REPOSITORY = sh(
                        script: 'git config --get remote.origin.url',
                        returnStdout: true
                    ).trim()

                    env.BRANCH_NAME_CUSTOM = sh(
                        script: 'git rev-parse --abbrev-ref HEAD',
                        returnStdout: true
                    ).trim()

                    env.COMMIT_ID = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    env.COMMIT_MESSAGE = sh(
                        script: 'git log -1 --pretty=%s',
                        returnStdout: true
                    ).trim()

                    // Lấy tên repository từ URL GitHub
                    env.REPOSITORY_NAME = sh(
                        script: '''
                            git config --get remote.origin.url |
                            sed 's/.*\\///' |
                            sed 's/\\.git$//'
                        ''',
                        returnStdout: true
                    ).trim()

                    echo "Repository: ${env.REPOSITORY_NAME}"
                    echo "Branch: ${env.BRANCH_NAME_CUSTOM}"
                    echo "Commit: ${env.COMMIT_ID}"
                }
            }
        }
        // 2. GỬI THÔNG BÁO BẮT ĐẦU DEPLOY
        stage('Notify Deploy Start') {
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
                        echo "Sending deploy start notification..."

                        MESSAGE="🚀 Bắt đầu deploy website
                                Repository: ${REPOSITORY_NAME}
                                Branch: ${BRANCH_NAME_CUSTOM}
                                Commit: ${COMMIT_ID}"

                        curl -sS --fail \
                            --request POST \
                            --url "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                            --data-urlencode "chat_id=${CHAT_ID}" \
                            --data-urlencode "text=${MESSAGE}"

                        echo "Deploy start notification sent."
                    '''
                }
            }
        }


        // 3. KIỂM TRA CODE
        stage('Test') {
            steps {
                echo 'GitHub connection OK!'

                sh '''
                    echo "===== PROJECT FILES ====="
                    ls -la
                    echo "========================="
                '''
            }
        }


        // 4. KIỂM TRA TELEGRAM
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
        // 5. KIỂM TRA WEBSITE VERCEL
        stage('Test Vercel Website') {
            steps {
                sh '''
                    echo "Checking Vercel website..."

                    HTTP_STATUS=$(curl \
                        -L \
                        -s \
                        -o /dev/null \
                        -w "%{http_code}" \
                        "$VERCEL_URL")

                    echo "Website: $VERCEL_URL"
                    echo "HTTP Status: $HTTP_STATUS"

                    if [ "$HTTP_STATUS" -ne 200 ]; then
                        echo "ERROR: Website returned HTTP $HTTP_STATUS"
                        exit 1
                    fi

                    echo "Vercel website is running successfully."
                '''
            }
        }
    }
    // 6. THÔNG BÁO KẾT QUẢ
    post {
        // DEPLOY THÀNH CÔNG
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
                    echo "Sending SUCCESS notification..."

                    MESSAGE=" Deploy thành công
                            Repository: ${REPOSITORY_NAME}
                            Branch: ${BRANCH_NAME_CUSTOM}
                            Website: ${VERCEL_URL}"

                    curl -sS --fail \
                        --request POST \
                        --url "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                        --data-urlencode "chat_id=${CHAT_ID}" \
                        --data-urlencode "text=${MESSAGE}"

                    echo "SUCCESS notification sent."
                '''
            }
        }
        // DEPLOY THẤT BẠI
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

                script {
                    // Lấy lỗi cuối cùng từ Jenkins log
                    def errorMessage = sh(
                        script: '''
                            set +e

                            ERROR=$(tail -n 30 "${WORKSPACE}@tmp/durable-"*/output.txt 2>/dev/null |
                                grep -E "ERROR|error|Error|FAILED|failed" |
                                tail -n 1)

                            if [ -z "$ERROR" ]; then
                                ERROR="Jenkins build failed. Check console log."
                            fi

                            echo "$ERROR"
                        ''',
                        returnStdout: true
                    ).trim()

                    // Giới hạn độ dài lỗi
                    if (errorMessage.length() > 500) {
                        errorMessage = errorMessage.take(500)
                    }
                    // Tránh ký tự xuống dòng làm hỏng message
                    errorMessage = errorMessage.replaceAll(/[\r\n]+/, ' ')

                    withEnv([
                        "ERROR_MESSAGE=${errorMessage}"
                    ]) {

                        sh '''
                            echo "Sending FAILURE notification..."

                            MESSAGE=" Deploy thất bại
                                    Repository: ${REPOSITORY_NAME}
                                    Branch: ${BRANCH_NAME_CUSTOM}
                                    Commit: ${COMMIT_ID}
                                    Error: ${ERROR_MESSAGE}"

                            curl -sS --fail \
                                --request POST \
                                --url "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                                --data-urlencode "chat_id=${CHAT_ID}" \
                                --data-urlencode "text=${MESSAGE}"

                            echo "FAILURE notification sent."
                        '''
                    }
                }
            }
        }
    }
}
