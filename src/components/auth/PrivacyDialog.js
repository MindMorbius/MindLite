import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

export default function PrivacyDialog({ open, onClose }) {
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
                  隐私政策
                </Dialog.Title>

                <div className="mt-4 prose dark:prose-invert max-w-none">
                  <h4>1. 数据存储说明</h4>
                  <p>本应用仅通过 Supabase 提供数据存储服务，包括：</p>
                  <ul>
                    <li>OAuth 登录信息</li>
                    <li>笔记内容</li>
                  </ul>

                  <h4>2. 第三方服务</h4>
                  <p>作为个人开发者，我们使用 Supabase 提供所有数据存储和身份验证服务。您的数据完全由 Supabase 管理，我们无法控制或保证第三方服务的数据处理方式。</p>

                  <h4>3. 免责声明</h4>
                  <p>本应用是个人非营利项目，既没有能力也没有意愿收集和利用用户信息。但由于使用第三方服务，我们无法完全控制数据安全性。</p>

                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      重要提示：如果您对数据隐私有严格要求，建议您在使用本服务前仔细考虑。继续使用则表示您理解并接受上述说明。
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