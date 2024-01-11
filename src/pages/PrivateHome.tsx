import Tippy from '@tippyjs/react';
import { Fragment } from 'react';
import { IoAdd } from 'react-icons/io5';
import { privateIcon } from '~/assets/icons';
import { useAddConversationContext } from '~/contexts/AddConversationContextProvider';

function PrivateHomePage() {
  const { setShowModalPrivate } = useAddConversationContext();
  return (
    <Fragment>
      <div className="flex-1 h-full flex items-center justify-center relative">
        <div className="w-full h-full flex flex-col items-center justify-center">
          <img className="w-1/6 md:w-1/3 " src={privateIcon.icon} alt={privateIcon.alt} />
          <p className="text-[1.2333333vw] md:text-[20px] sm:!text-[16px] font-semibold">
            Select a chat to start messaging
          </p>
        </div>
        <Tippy content="New Security Conversation">
          <button
            onClick={() => setShowModalPrivate(true)}
            className="absolute bottom-[2vw] hover:scale-125 right-[2vw] w-[50px] h-[50px] bg-primary-color rounded-full flex items-center justify-center shadow-fab button-add"
          >
            <IoAdd className="text-[30px] text-white " />
          </button>
        </Tippy>
      </div>
    </Fragment>
  );
}

export default PrivateHomePage;
