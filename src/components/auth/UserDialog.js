import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import Button from '@/components/ui/Button'
import { useStore } from '@/lib/store'

export default function UserDialog({ isOpen, onClose }) {
  const { user, signOut } = useStore()
  const metadata = user?.user_metadata || {}
  const provider = user?.app_metadata?.provider
  const createdAt = new Date(user?.created_at).toLocaleDateString('zh-CN')

  const accountInfo = [
    { label: '用户名', value: metadata.user_name || metadata.name },
    { label: '邮箱', value: user?.email },
    provider === 'linux_do' && { label: 'Linux.do ID', value: metadata.linux_do_id },
    provider === 'linux_do' && { label: '信任等级', value: metadata.trust_level },
    { label: '注册时间', value: createdAt },
    { label: '登录方式', value: provider === 'linux_do' ? 'Linux.do' : 'GitHub' },
    { label: '最后登录', value: metadata.last_sign_in && new Date(metadata.last_sign_in).toLocaleString('zh-CN') }
  ].filter(Boolean)

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

                <div className="flex flex-col items-center">
                  <img 
                    src={metadata.avatar_url} 
                    alt="avatar"
                    className="w-24 h-24 rounded-full mb-4"
                  />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                    {metadata.full_name || metadata.user_name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      账号信息
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      {accountInfo.map(({ label, value }) => (
                        value && (
                          <p key={label}>
                            {label}: {value}
                          </p>
                        )
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      使用统计
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>笔记数量: {/* TODO: 添加笔记统计 */}</p>
                      <p>最后登录: {/* TODO: 添加最后登录时间 */}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                  >
                    关闭
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      signOut()
                      onClose()
                    }}
                  >
                    退出登录
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 