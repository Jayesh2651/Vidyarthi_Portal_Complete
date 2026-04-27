import apiClient from './apiClient'

export const portalService = {
  getOptions() {
    return apiClient.get('/options/')
  },
  getHome() {
    return apiClient.get('/home/')
  },
  getDashboardSummary() {
    return apiClient.get('/dashboard/summary/')
  },
  getAssignments(params = {}) {
    return apiClient.get('/assignments/', { params })
  },
  createAssignment(formData) {
    return apiClient.post('/assignments/', formData)
  },
  getSyllabus() {
    return apiClient.get('/syllabus/')
  },
  createSyllabus(formData) {
    return apiClient.post('/syllabus/', formData)
  },
  getUnitTests(params = {}) {
    return apiClient.get('/unit-tests/', { params })
  },
  createUnitTest(formData) {
    return apiClient.post('/unit-tests/', formData)
  },
  getQuestionPapers(params = {}) {
    return apiClient.get('/question-papers/', { params })
  },
  createQuestionPaper(formData) {
    return apiClient.post('/question-papers/', formData)
  },
  createNewsLinkEntry(formData) {
    return apiClient.post('/news-links/', formData)
  },
  downloadPdf(content) {
    return apiClient.post(
      '/download-pdf/',
      { content },
      {
        responseType: 'blob',
      },
    )
  },
}
