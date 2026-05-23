pipeline {
    agent { label 'docker' }

    environment {
        DOCKER_USER     = "ma7moudsharqawi"
        FRONTEND        = "${DOCKER_USER}/frontend"
        NGINX           = "${DOCKER_USER}/nginx"
        BACKEND         = "${DOCKER_USER}/backend"
        WORKER          = "${DOCKER_USER}/worker"
        ORDER_PROCESS   = "${DOCKER_USER}/order-process"
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
                    def branch = (env.BRANCH_NAME ?: env.GIT_BRANCH)?.replace("origin/", "")
                    echo "Branch: ${branch}"
                    if (!(branch in ['dev', 'main'])) {
                        error("Pipeline only runs on dev or main. Current: ${branch}")
                    }
                }
            }
        }

        // ────────────────────────── Build `test` stage ──────────────────────────
        stage('Build & Test Frontend') {
            steps {
                sh '''
                    docker build \
                        --target test \
                        --cache-from $FRONTEND:latest \
                        -t $FRONTEND:test \
                        ./frontend
                '''
            }
            post {
                success { echo "All frontend tests passed." }
                failure { echo "Frontend tests failed — aborting pipeline." }
            }
        }

        stage('Build & Test Backend') {
            steps {
                sh '''
                    docker build \
                        --target test \
                        --cache-from $BACKEND:latest \
                        -t $BACKEND:test \
                        ./backend
                '''
            }
            post {
                success { echo "Backend tests passed." }
                failure { echo "Backend tests failed — aborting." }
            }
        }

        stage('Build & Test Order-Process') {
            steps {
                sh '''
                    docker build \
                        --target test \
                        --cache-from $ORDER_PROCESS:latest \
                        -t $ORDER_PROCESS:test \
                        ./order-process
                '''
            }
            post {
                success { echo "Order-process tests passed." }
                failure { echo "Order-process tests failed — aborting." }
            }
        }

        // ────────────────────────── Build all production images ─────────────────────────────────────
        stage('Build Production Images') {
            steps {
                sh '''
                    docker pull $FRONTEND:latest      || true
                    docker pull $BACKEND:latest       || true
                    docker pull $NGINX:latest         || true
                    docker pull $WORKER:latest        || true
                    docker pull $ORDER_PROCESS:latest || true

                    docker build --cache-from=$FRONTEND:latest      -t $FRONTEND:${GIT_COMMIT}      ./frontend
                    docker build --cache-from=$NGINX:latest         -t $NGINX:${GIT_COMMIT}         ./nginx
                    docker build --cache-from=$BACKEND:latest       -t $BACKEND:${GIT_COMMIT}       ./backend
                    docker build --cache-from=$WORKER:latest        -t $WORKER:${GIT_COMMIT}        ./worker
                    docker build --cache-from=$ORDER_PROCESS:latest -t $ORDER_PROCESS:${GIT_COMMIT} ./order-process
                '''
            }
        }

        // ────────────────────────── Push to Docker Hub ──────────────────────────────────────────────
        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-creds',
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    sh '''
                        echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin

                        docker push $FRONTEND:${GIT_COMMIT}
                        docker push $NGINX:${GIT_COMMIT}
                        docker push $BACKEND:${GIT_COMMIT}
                        docker push $WORKER:${GIT_COMMIT}
                        docker push $ORDER_PROCESS:${GIT_COMMIT}

                        docker tag $FRONTEND:${GIT_COMMIT}      $FRONTEND:latest
                        docker tag $NGINX:${GIT_COMMIT}         $NGINX:latest
                        docker tag $BACKEND:${GIT_COMMIT}       $BACKEND:latest
                        docker tag $WORKER:${GIT_COMMIT}        $WORKER:latest
                        docker tag $ORDER_PROCESS:${GIT_COMMIT} $ORDER_PROCESS:latest

                        docker push $FRONTEND:latest
                        docker push $NGINX:latest
                        docker push $BACKEND:latest
                        docker push $WORKER:latest
                        docker push $ORDER_PROCESS:latest
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                expression { env.BRANCH_NAME in ['dev', 'main'] }
            }
            steps {
                withKubeConfig([credentialsId: 'k8s-cluster-creds']) {
                    sh """
                        kubectl set image deployment/frontend      frontend=$FRONTEND:${env.GIT_COMMIT}           --namespace=ecommerce
                        kubectl set image deployment/backend       backend=$BACKEND:${env.GIT_COMMIT}             --namespace=ecommerce
                        kubectl set image deployment/order-process order-process=$ORDER_PROCESS:${env.GIT_COMMIT} --namespace=ecommerce

                        kubectl rollout status deployment/frontend      --namespace=ecommerce
                        kubectl rollout status deployment/backend       --namespace=ecommerce
                        kubectl rollout status deployment/order-process --namespace=ecommerce
                    """
                }
            }
        }
    }

    post {
        always {
            sh '''
                docker rmi $FRONTEND:test || true
                docker logout             || true
                docker system prune -f    || true
            '''
        }
        success { echo "Pipeline completed successfully." }
        failure { echo "Pipeline failed." }
    }
}