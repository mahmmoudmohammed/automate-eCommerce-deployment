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

        APPLICATION_NAME = "automate-eCommerce-deployment"
        STAGING_ENV = "automate-eCommerce-deployment-staging"
        PROD_ENV = "automate-eCommerce-deployment-env"
        S3_BUCKET = "s3-eb-deployments-bucket"
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
                    if (!(branch in ["dev", "main"])) {
                        error("This pipeline runs only on dev or main branches. Current: ${branch}")
                    }
                }
            }
        }

        stage('Run Frontend Tests with Coverage') {
            steps {
                script {
                    echo "Running Jest tests for frontend with coverage..."
                }
                dir('frontend') {
                    sh '''
                        # Clean install dependencies
                        npm ci

                        # Run all Jest tests in CI mode with coverage enabled
                        npm test -- --ci --coverage
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'frontend/coverage/**', fingerprint: true
                }
                failure {
                    echo "Frontend tests failed!"
                }
                success {
                    echo "Frontend tests passed with coverage collected."
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
                    docker pull $FRONTEND:latest || true
                    docker pull $BACKEND:latest || true
                    docker pull $NGINX:latest || true
                    docker pull $WORKER:latest || true

                    docker build --cache-from=$FRONTEND:latest -t $FRONTEND:${GIT_COMMIT} ./frontend
                    docker build --cache-from=$NGINX:latest -t $NGINX:${GIT_COMMIT} ./nginx
                    docker build --cache-from=$BACKEND:latest -t $BACKEND:${GIT_COMMIT} ./backend
                    docker build --cache-from=$WORKER:latest -t $WORKER:${GIT_COMMIT} ./worker
                '''
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                    docker push $FRONTEND:${GIT_COMMIT}
                    docker push $NGINX:${GIT_COMMIT}
                    docker push $BACKEND:${GIT_COMMIT}
                    docker push $WORKER:${GIT_COMMIT}

                    # also tag as latest for caching next builds
                    docker tag $FRONTEND:${GIT_COMMIT} $FRONTEND:latest
                    docker tag $NGINX:${GIT_COMMIT} $NGINX:latest
                    docker tag $BACKEND:${GIT_COMMIT} $BACKEND:latest
                    docker tag $WORKER:${GIT_COMMIT} $WORKER:latest

                    docker push $FRONTEND:latest
                    docker push $NGINX:latest
                    docker push $BACKEND:latest
                    docker push $WORKER:latest
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                expression { env.BRANCH_NAME in ['dev', 'main'] }
            }
            steps {
                withKubeConfig([credentialsId: 'k8s-cluster-creds']) {
                    sh """
                        echo "Deploying to Kubernetes with raw kubectl..."

                        kubectl set image deployment/frontend frontend=$FRONTEND:${env.GIT_COMMIT} --namespace=${env.BRANCH_NAME}
                        kubectl set image deployment/backend backend=$BACKEND:${env.GIT_COMMIT} --namespace=${env.BRANCH_NAME}
                        kubectl set image deployment/nginx nginx=$NGINX:${env.GIT_COMMIT} --namespace=${env.BRANCH_NAME}
                        kubectl set image deployment/worker worker=$WORKER:${env.GIT_COMMIT} --namespace=${env.BRANCH_NAME}

                        kubectl rollout status deployment/frontend --namespace=${env.BRANCH_NAME}
                        kubectl rollout status deployment/backend --namespace=${env.BRANCH_NAME}
                        kubectl rollout status deployment/nginx --namespace=${env.BRANCH_NAME}
                        kubectl rollout status deployment/worker --namespace=${env.BRANCH_NAME}

                        echo "Kubernetes deployment done"
                    """
                }
            }
        }

        stage('Package Artifacts') {
            steps {
                sh '''
                    mkdir -p artifacts
                    tar -czf artifacts/frontend.tar.gz ./frontend
                    tar -czf artifacts/backend.tar.gz ./backend
                    tar -czf artifacts/nginx.tar.gz ./nginx
                    tar -czf artifacts/worker.tar.gz ./worker
                '''
            }
        }

        stage('Store Artifacts') {
            steps {
                archiveArtifacts artifacts: 'artifacts/*.tar.gz', fingerprint: true
            }
        }

        stage('Create Deployment Package') {
            steps {
                sh 'zip -r deploy.zip . -x "*.git*"'
            }
        }

        stage('Upload to S3') {
            steps {
                withAWS(credentials: 'aws-eb-creds', region: 'us-east-1') {
                    sh """
                        aws s3 cp deploy.zip s3://$S3_BUCKET/deploy-${env.GIT_COMMIT}.zip --acl private
                    """
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                expression { env.BRANCH_NAME == 'dev' }
            }
            steps {
                withAWS(credentials: 'aws-eb-creds', region: 'us-east-1') {
                    sh """
                        echo "Deploying to Elastic Beanstalk staging..."
                        aws elasticbeanstalk create-application-version \
                        --application-name $APPLICATION_NAME \
                        --version-label ${env.GIT_COMMIT} \
                        --source-bundle S3Bucket=$S3_BUCKET,S3Key=deploy-${env.GIT_COMMIT}.zip

                        aws elasticbeanstalk update-environment \
                        --environment-name $STAGING_ENV \
                        --version-label ${env.GIT_COMMIT}
                        echo "Staging EB deployment done"
                    """
                }
            }
        }

        stage('Approval for Production') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                input message: "Deploy to production?", ok: "Deploy"
            }
        }

        stage('Deploy to Production') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                withAWS(credentials: 'aws-eb-creds', region: 'us-east-1') {
                    sh """
                        echo "Deploying to Elastic Beanstalk production..."
                        aws elasticbeanstalk update-environment \
                        --environment-name $PROD_ENV \
                        --version-label ${env.GIT_COMMIT}
                        echo "Production EB deployment done"
                    """
                }
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