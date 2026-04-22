pipeline {
    agent {
        label 'docker'
    }

    environment {
        DOCKER_USER = "ma7moudsharqawi"

        FRONTEND = "${DOCKER_USER}/frontend"
        NGINX    = "${DOCKER_USER}/nginx"
        BACKEND  = "${DOCKER_USER}/backend"
        WORKER   = "${DOCKER_USER}/worker"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate Branch') {
            steps {
                script {
                    def branch = env.BRANCH_NAME ?: env.GIT_BRANCH
                    branch = branch?.replace("origin/", "")

                    echo "Running on branch: ${branch}"

                    if (branch != "dev") {
                        error("This pipeline runs only on dev branch. Current: ${branch}")
                    }
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-creds',
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    sh '''
                        echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                    '''
                }
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                    docker build -t $FRONTEND ./frontend
                    docker build -t $NGINX ./nginx
                    docker build -t $BACKEND ./backend
                    docker build -t $WORKER ./worker
                '''
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                    docker push $FRONTEND
                    docker push $NGINX
                    docker push $BACKEND
                    docker push $WORKER
                '''
            }
        }
    }

    post {
        always {
            sh '''
                docker logout || true
                docker system prune -f || true
            '''
        }

        success {
            echo "Pipeline completed successfully"
        }

        failure {
            echo "Pipeline failed"
        }
    }
}