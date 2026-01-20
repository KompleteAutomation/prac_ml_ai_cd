pipeline {
    agent any

    environment {
        BASE_URL = 'https://aiglobal.space'
        WORKERS = '1'
        OPENAI_API_KEY = credentials('OPENAI_API_KEY')
        SETUP_MODE = 'api'
        EXECUTION_CSV = 'ml_analysis/execution_results/execution_records_500_runs.csv'
        REPORT_NAME   = "report_${BUILD_NUMBER}"

        options {
            timestamps()
        }

        stages {
            stage('Checkout') {
                steps {
                    checkout scm
                }
            }

            stage('Install Dependencies') {
                steps {
                    sh 'npm install'
                }
            }

            stage('Data Reader + Validator') {
                steps {
                    echo 'Running DataReader and DataValidator...'
                    // Called internally by testCasePrioritization.js
                    sh """
                   OPENAI_API_KEY=${OPENAI_API_KEY} \
                   node ml_analysis/lib/testCasePrioritization.js \
                   ${EXECUTION_CSV} ${REPORT_NAME}
                """
                }
            }

            stage('Failure Clustering') {
                steps {
                    echo 'FailureAnalyzer executed inside pipeline script'
                    // Already executed in previous node command
                    echo 'Failure clustering completed'
                }
            }

            stage('Priority Dataset Generation') {
                steps {
                    echo 'PriorityDatasetGenerator executed inside pipeline script'
                    echo 'ML feature dataset created'
                }
            }

            stage('Stakeholder HTML Report') {
                steps {
                    echo 'StakeholderReportGenerator executed'
                }
            }

            stage('RCA CSV Report') {
                steps {
                    echo 'RCAReportGenerator executed'
                }
            }

            stage('Publish Reports') {
                steps {
                    echo 'Publishing reports...'
                    archiveArtifacts artifacts: 'ml_analysis/reports/**/*.*', fingerprint: true
                }
            }
        }

        post {
            success {
                echo 'AI-driven QA Intelligence Pipeline completed successfully'
            }
            failure {
                echo 'Pipeline failed — check console logs'
            }
        }

        success {
            echo '✅ Pipeline completed successfully.'
        }

        unstable {
            echo '🟠 Tests failed — Build marked UNSTABLE. Reports & RCA generated successfully.'
        }

        failure {
            echo '🔴 Pipeline infrastructure failure.'
        }
    }
}
