pipeline {
    agent {
        label 'docker'
    }
 
    stages {
        stage('Build Docker Images') {
            steps {
                script {
                    sh '''
                    docker build -t ma7moudsharqawi/frontend ./frontend
                    docker build -t ma7moudsharqawi/nginx ./nginx
                    docker build -t ma7moudsharqawi/backend ./backend
                    docker build -t ma7moudsharqawi/worker ./worker
                    '''
                }
            }

        stage('Push Docker Images') {
            steps {
                script {
                    sh '''
                    docker push ma7moudsharqawi/frontend
                    docker push ma7moudsharqawi/nginx
                    docker push ma7moudsharqawi/backend
                    docker push ma7moudsharqawi/worker
                    '''
                }
            }
        }
 
        stage('Run Tests') {
            steps {
                script {
                    env.DOCKER_BUILDKIT = 1
                    sh 'docker run -e CI=true hudaelmrakby/docker-react npm run test'
                }
            }
        }
    }
}