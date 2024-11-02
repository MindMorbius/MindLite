import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import Button from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import TermsDialog from '@/components/auth/TermsDialog'
import PrivacyDialog from '@/components/auth/PrivacyDialog'

export default function AuthModal({ isOpen, onClose }) {
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (provider) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/workspace`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>

                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 text-center mb-4"
                >
                  登录到 MindLite
                </Dialog.Title>

                <div className="mt-8 space-y-4">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2 h-12"
                    onClick={() => handleLogin('github')}
                    disabled={isLoading}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                      />
                    </svg>
                    <span>{isLoading ? '登录中...' : '使用 GitHub 登录'}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2 h-12 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <rect x="0" y="0" width="24" height="8" fill="#000000" />
                      <rect x="0" y="8" width="24" height="8" fill="#FFFFFF" />
                      <rect x="0" y="16" width="24" height="8" fill="#FFA500" />
                    </svg>
                    <span>使用 Linux.do 登录 (未实现)</span>
                  </Button>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  登录即表示您同意我们的
                  <button 
                    onClick={() => setShowTerms(true)}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mx-1"
                  >
                    服务条款
                  </button>
                  和
                  <button 
                    onClick={() => setShowPrivacy(true)}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 ml-1"
                  >
                    隐私政策
                  </button>
                </div>

                <TermsDialog open={showTerms} onClose={() => setShowTerms(false)} />
                <PrivacyDialog open={showPrivacy} onClose={() => setShowPrivacy(false)} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 