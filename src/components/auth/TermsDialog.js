import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

export default function TermsDialog({ open, onClose }) {
  return (
    <Transition appear show={open} as={Fragment}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>

                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4"
                >
                  服务条款
                </Dialog.Title>

                <div className="mt-4 prose dark:prose-invert max-w-none">
                  <h4>1. 服务性质</h4>
                  <p>本应用是一个个人开发的非营利性在线笔记服务。我们使用第三方服务商（如 Supabase）来提供数据存储和身份验证等功能。</p>

                  <h4>2. 免责声明</h4>
                  <p>作为个人开发者，我们会尽最大努力保护您的数据安全，但由于使用第三方服务，可能存在不可控因素。如发生数据问题，属于技术能力限制，并非恶意行为。</p>

                  <h4>3. 服务稳定性</h4>
                  <p>本应用可能随时发生功能变更或服务中断，这属于正常现象。我们会努力维护服务的稳定性，但不对服务的连续性做出保证。</p>

                  <h4>4. 问题反馈</h4>
                  <p>如遇到任何问题或建议，请通过 GitHub 项目仓库与开发者联系。我们重视每一位用户的反馈，但响应时间可能因个人精力有限而有所延迟。</p>

                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      注意：继续使用本服务即表示您理解并接受上述条款。如果您对这些条款有任何疑虑，请勿使用本服务。
                    </p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 