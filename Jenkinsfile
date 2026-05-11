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

                stage('Run Frontend Tests') {
            steps {
                script {
                    echo "Running Jest tests for frontend..."
                }
                dir('frontend') {
                    // Install dependencies and run Jest
                    sh '''
                        npm ci
                        npm test -- --ci --reporters=default --reporters=jest-junit
                    '''
                }
            }
            post {
                always {
                    // Publish test results to Jenkins
                    junit 'frontend/junit.xml'
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
                    docker context use desktop-linux
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