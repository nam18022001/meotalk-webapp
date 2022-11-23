import { memo, useEffect, useRef, useState } from 'react';
import HeadlessTippy from '@tippyjs/react/headless';
import classNames from 'classnames/bind';
import { ImSpinner } from 'react-icons/im';
import { FiSearch } from 'react-icons/fi';
import { HiXCircle } from 'react-icons/hi';

import { Wrapper as PopperWrapper } from '~/components/Popper';
import useDebounce from '~/hooks/useDebounce';
import styles from './Search.module.scss';
import AccountItem from '~/components/AccountItem';
import searchUser from '~/services/searchUser';
import { onSnapshot } from 'firebase/firestore';

const cx = classNames.bind(styles);

function Search() {
  // state
  const [searchValue, setSearchValue] = useState('');
  const [searchRsults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(true);
  // hook make by myseft
  const debounced = useDebounce(searchValue, 600);

  // ref
  const inputref = useRef();

  useEffect(() => {
    if (!debounced.trim()) {
      setSearchResults([]);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      const users = searchUser(debounced);
      await onSnapshot(users, (querySnapshot) => {
        const user = [];
        querySnapshot.forEach((res) => {
          user.push(res.data());
        });
        setSearchResults(user);
      });

      setIsLoading(false);
    };
    search();
  }, [debounced]);

  // function
  const handleClickClear = () => {
    setSearchValue('');
    inputref.current.focus();
  };

  const handleInput = (e) => {
    const searchValue = e.target.value.toLowerCase();
    if (!searchValue.startsWith(' ')) {
      setSearchValue(searchValue);
    }
  };

  return (
    // Using a wrapper <div> tag to fix tippy warning
    <div>
      <HeadlessTippy
        visible={showResult && searchValue.length > 0}
        interactive
        render={(attrs) => (
          <div className={cx('search-result')} tabIndex="-1" {...attrs}>
            <PopperWrapper>
              <h4 className={cx('search-title')}>We could found:</h4>
              <div className={cx('list-account')}>
                {searchRsults.map(
                  (res, index) => res.uid !== localStorage.getItem('uid') && <AccountItem key={index} data={res} />,
                )}
              </div>
            </PopperWrapper>
          </div>
        )}
        onClickOutside={() => setShowResult(false)}
      >
        <div className={cx('search')}>
          <input
            ref={inputref}
            value={searchValue}
            onChange={(e) => handleInput(e)}
            spellCheck={false}
            onFocus={() => setShowResult(true)}
            placeholder="Find your friends by email"
          />
          {!!searchValue && !isLoading && (
            <button className={cx('clear')} onClick={handleClickClear}>
              <HiXCircle />
            </button>
          )}
          {isLoading && <ImSpinner className={cx('loading')} />}
          <button className={cx('btn-search')}>
            <FiSearch className={cx('icon-search')} />
          </button>
        </div>
      </HeadlessTippy>
    </div>
  );
}

export default memo(Search);
