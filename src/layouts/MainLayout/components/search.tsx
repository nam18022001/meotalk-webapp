import HeadlessTippy from '@tippyjs/react/headless';
import CryptoJS from 'crypto-js';
import { Fragment, memo, useEffect, useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { HiXCircle } from 'react-icons/hi';
import { ImSpinner } from 'react-icons/im';

import { onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import SearchAccountItem from '~/components/SearchAccountItem';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';
import useDebounce from '~/hooks/useDebounce';
import { searchUser } from '~/services/searchServices';

function Search() {
  const nav = useNavigate();
  const { isMobile } = useMobileContext();
  const { currentUser } = useAuthContext();
  // state
  const [searchValue, setSearchValue] = useState('');
  const [searchRsults, setSearchResults] = useState<{}[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [showResult, setShowResult] = useState(true);

  // hook make by myseft
  const debounced = useDebounce(searchValue, 600);

  useEffect(() => {
    if (!debounced.trim()) {
      setSearchResults([]);
      return;
    }

    const search = async () => {
      const users = searchUser(debounced);
      onSnapshot(users, (querySnapshot) => {
        const user: {}[] = [];
        querySnapshot.forEach((res) => {
          user.push(res.data());
        });
        setSearchResults(user);
      });
    };
    search();
  }, [debounced]);

  useEffect(() => {
    if (searchValue.length > 0) {
      setIsLoading(true);
      if (searchRsults.length > 0) {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [searchValue, searchRsults]);

  // ref
  const inputref = useRef<HTMLInputElement>(null);
  // function
  const handleClickClear = () => {
    setSearchValue('');
    inputref?.current?.focus();
  };
  const handleInput = (e: any) => {
    const searchValue: string = e.target.value.toLowerCase();
    if (!searchValue.startsWith(' ')) {
      setSearchValue(searchValue);
    }
  };

  const handleClickProfile = (data: any, addSent?: boolean, isRecieveRequest?: boolean, isFriend?: boolean) => {
    const hastUrlProfile = CryptoJS.Rabbit.encrypt(data.uid, 'hashUrlProfile').toString();

    nav('/profile/' + encodeURIComponent(hastUrlProfile), { state: { data, addSent, isRecieveRequest, isFriend } });
  };
  return (
    <Fragment>
      <HeadlessTippy
        interactive
        visible={showResult && searchValue.length > 0}
        onClickOutside={() => setShowResult(false)}
        render={(attrs) => (
          <div
            className={`${
              isMobile
                ? 'w-[calc(100vw_-_30px)] xs:w-[calc(100vw_-_10px)] max-h-[calc(100vh_/_1.5)]'
                : ' sm:!w-sm-search-bar-width md:w-md-search-bar-width w-search-sidebar-width '
            } search-result-headless`}
            tabIndex={-1}
            {...attrs}
          >
            <h4 className="search-title-headless sm:text-[14px]">We could found:</h4>
            <div className="list-account-headless">
              {searchRsults.map(
                (res: any, index: number) =>
                  res.uid !== currentUser.uid && (
                    <SearchAccountItem key={index} data={res} onClick={handleClickProfile} />
                  ),
              )}
            </div>
          </div>
        )}
      >
        <div
          className={`${
            isMobile
              ? 'flex-1 h-[45px] xs:h-[35px] mx-[5px] after:right-[30px]'
              : 'mx-[10px] sm:!w-sm-search-bar-width sm:!h-sm-search-bar-height md:w-md-search-bar-width md:h-md-search-bar-height w-search-sidebar-width h-search-sidebar-height'
          }  search-bar `}
        >
          <input
            ref={inputref}
            className={`w-full h-full search-input ${isMobile ? 'text-[14px] pr-[10px]' : ''}`}
            onFocus={() => setShowResult(true)}
            value={searchValue}
            onChange={(e) => handleInput(e)}
            spellCheck={false}
            placeholder="Find your friends by email"
          />
          {!!searchValue && !isLoading && searchRsults.length > 0 && (
            <button
              className={`${isMobile ? 'right-[40px] text-[14px]' : ''}  search-input-clear`}
              onClick={handleClickClear}
            >
              <HiXCircle />
            </button>
          )}
          {isLoading && searchRsults.length < 1 && (
            <ImSpinner className={`${isMobile ? 'right-[40px] text-[14px]' : ''} search-input-loading`} />
          )}
          <button className={`btn-search ${isMobile ? 'text-[14px] p-0 w-[30px]' : ''}`}>
            <FiSearch className="icon-search" />
          </button>
        </div>
      </HeadlessTippy>
    </Fragment>
  );
}

export default memo(Search);
