import React, { useState, useRef, useCallback } from 'react'
import { Upload, CheckCircle, AlertCircle, Sparkles, X } from 'lucide-react'

// UI Components
const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg shadow-lg ${className}`}>{children}</div>
)

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
)

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm ${className}`}>{children}</p>
)

const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 pb-6 ${className}`}>{children}</div>
)

function App() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  
  const fileInputRef = useRef(null)

  // Webhook URLs
  const WEBHOOK_URLS = {
    test: 'https://cape-fear-automations.app.n8n.cloud/webhook-test/70729559-d618-4bbf-95ad-b4b3c88b645d',
    production: 'https://cape-fear-automations.app.n8n.cloud/webhook/70729559-d618-4bbf-95ad-b4b3c88b645d'
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError('')
    setSuccess('')
    setUploadedFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      // File loaded successfully
    }
    reader.readAsDataURL(file)
  }

  const processOCR = async () => {
    if (!uploadedFile) {
      setError('Please select a file first')
      return
    }

    if (!userEmail.trim()) {
      setError('Please enter your email address')
      return
    }

    try {
      setIsProcessing(true)
      setError('')
      setSuccess('')
      
      setProcessingStep('Preparing document...')
      
      const formData = new FormData()
      formData.append('image', uploadedFile)
      formData.append('filename', uploadedFile.name)
      formData.append('filesize', uploadedFile.size.toString())
      formData.append('email', userEmail.trim())
      formData.append('phone', userPhone.trim())
      
      setProcessingStep('Sending to processing service...')
      
      const webhookUrl = WEBHOOK_URLS.production
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.text()
      setProcessingStep('Processing complete!')
      setSuccess('Document processed successfully! Check your email for results.')
      
    } catch (error) {
      console.error('Processing failed:', error)
      setError(`Failed to process document: ${error.message}`)
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  const resetApp = () => {
    setUploadedFile(null)
    setError('')
    setSuccess('')
    setIsProcessing(false)
    setProcessingStep('')
    setUserEmail('')
    setUserPhone('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          🖋️ Ink and Feather
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto px-4">
          Upload handwritten documents to extract text and automate your workflow
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="max-w-2xl mx-auto mb-6 px-4">
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-2xl mx-auto mb-6 px-4">
          <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="max-w-2xl mx-auto mb-8 px-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-xl text-center">Your Information</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              We'll send the results to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Upload Section */}
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">📄 Upload Your Document</CardTitle>
            <CardDescription className="text-gray-400">
              Drop your handwritten document here to extract text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-white mb-2">
                    Drop your document here
                  </h3>
                  <p className="text-gray-400 mb-4">
                    or click to browse your files
                  </p>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Choose File
                  </button>
                </div>
                
                <div className="flex justify-center gap-2 text-sm text-gray-500">
                  <span className="bg-gray-800 px-2 py-1 rounded">JPG</span>
                  <span className="bg-gray-800 px-2 py-1 rounded">PNG</span>
                  <span className="bg-gray-800 px-2 py-1 rounded">WebP</span>
                  <span className="bg-gray-800 px-2 py-1 rounded">HEIC</span>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploadedFile && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{uploadedFile.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetApp}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Start Over
                  </button>
                </div>
                
                <button
                  onClick={processOCR}
                  disabled={isProcessing || !userEmail.trim()}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {processingStep || 'Processing...'}
                    </div>
                  ) : (
                    'Process Document'
                  )}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center py-12 text-gray-500">
        <p className="flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          Powered by intelligent document processing
        </p>
        <p className="mt-2">
          Transform your handwritten notes into digital workflows ✒️
        </p>
      </div>
    </div>
  )
}

export default App

