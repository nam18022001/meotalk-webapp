import TippyHeadLess from '@tippyjs/react/headless';
import { Fragment, useState } from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
const defaultFn = () => {};
function Menu({
  children,
  items = [],
  onChange = defaultFn,
  show,
  onClickOutSide,
}: {
  children: any;
  items: any[];
  onChange: (a: any) => void;
  show: boolean;
  onClickOutSide: () => void;
}) {
  const [history, setHistory] = useState<any>([{ data: items }]);
  const current = history[history.length - 1];
  const renderItems = () => {
    return current.data.map((item: any, index: number) => {
      const isParent = !!item.children;

      const handleClickMenuItem = () => {
        if (isParent) {
          setHistory((preHistory: any) => [...preHistory, item.children]);
        } else {
          onChange(item);
        }
      };

      return <MenuItem key={index} data={item} onClick={item.onClick || handleClickMenuItem} />;
    });
  };

  const MenuItem = ({ data, onClick }: { data: any; onClick: any }) => {
    const classes = `menu-item ${data.separate ? 'separate-menu' : ''}`;

    return data.to ? (
      <Link to={data.to} className={`${classes} flex items-center`}>
        <span className="mr-[10px]">{data.icon}</span>

        {data.title}
      </Link>
    ) : (
      <button className={`${classes} flex items-center`} onClick={onClick}>
        <span className="mr-[10px]">{data.icon}</span>
        {data.title}
      </button>
    );
  };

  return (
    <Fragment>
      <TippyHeadLess
        interactive
        visible={show}
        placement="bottom-end"
        offset={[12, 10]}
        render={(attrs) => (
          <div
            className="menu-list rounded-[8px] !border !border-solid !border-transparent overflow-hidden"
            tabIndex={-1}
            {...attrs}
          >
            <div className={`wrapper-menu menu-popper `}>
              {history.length > 1 && (
                <div className="header-menu">
                  <button
                    className="back-btn-menu"
                    onClick={() => {
                      setHistory((prev: any) => prev.slice(0, prev.length - 1));
                    }}
                  >
                    <FiChevronLeft />
                  </button>
                  <h4 className="header-title-menu">{current.title}</h4>
                </div>
              )}

              <div className="menu-body">{renderItems()}</div>
            </div>
          </div>
        )}
        onClickOutside={onClickOutSide}
        onHide={() => {
          setHistory((prev: any) => prev.slice(0, 1));
        }}
      >
        {children}
      </TippyHeadLess>
    </Fragment>
  );
}

export default Menu;
