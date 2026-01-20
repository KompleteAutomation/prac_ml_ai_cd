pipeline {
    agent any

    environment {
        BASE_URL = 'https://aiglobal.space'
        WORKERS = '1'
        SETUP_MODE = 'api'
        EXECUTION_CSV = 'ml_analysis\\execution_results\\execution_records_500_runs.csv'
        REPORT_NAME = "report_${BUILD_NUMBER}"


        // OpenAI key from Jenkins Credentials
        OPENAI_API_KEY = credentials('OPENAI_API_KEY')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node dependencies...'
                bat 'npm install'
            }
        }

        stage('Run AI Test Intelligence Pipeline') {
            steps {
                bat """
        set OPENAI_API_KEY=%OPENAI_API_KEY%
        node ml_analysis\\lib\\testCasePrioritization.js %EXECUTION_CSV% report_${BUILD_NUMBER}
        """
            }
        }

        stage('Publish Reports') {
            steps {
                archiveArtifacts artifacts: 'ml_analysis/reports/**/*.*', fingerprint: true
            }
        }
    }

    post {
        success {
            echo '✅ AI-driven QA Intelligence Pipeline completed successfully'
            echo "📊 Stakeholder Report: ${BUILD_URL}artifact/ml_analysis/reports/stakeholder_report_report_${BUILD_NUMBER}.html"
        }

        failure {
            echo '🔴 Pipeline failed — check console logs'
        }
    }
}
