import { AiOutlineUserAdd, AiOutlineUsergroupAdd } from 'react-icons/ai';
import routes from './routes';
const actionsFab = [
  { tooltip: 'User Messages', icon: <AiOutlineUserAdd />, link: routes.home },
  { tooltip: 'Group Messages', icon: <AiOutlineUsergroupAdd />, link: routes.home },
];

export default actionsFab.reverse();
