import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import {
  FETCH_HOME_USER,
  DISMISS_NOTIFICATION,
  ACCEPT_CONNECTION,
  DELETE_CONNECTION,
  CREATE_QRCODE
} from '../queries/index';
import HashLoader from 'react-spinners/HashLoader';
import { Link } from '@reach/router';
import QRCode from 'qrcode.react';

const Home = () => {
  const { loading, error, data } = useQuery(FETCH_HOME_USER);

  const [qrCode, setQRCode] = useState();
  const [createQRCode] = useMutation(CREATE_QRCODE);

  const [position, setPosition] = useState({});

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setPosition(position);
    });

    (async () => {
      const qrCode = localStorage.getItem('qrCode');
      if (qrCode) return setQRCode(qrCode);
      const { data } = await createQRCode({ variables: { label: 'homepage' } });
      const { id } = data.createQRCode.qrcode;
      localStorage.setItem('qrCode', id);
      setQRCode(id);
    })();
  }, [createQRCode])

  const [dismissNotification, { loading: dismissLoading }] = useMutation(DISMISS_NOTIFICATION, {
    update(cache, { data: { deleteNotification: { notification } } }) {
      const { user } = cache.readQuery({ query: FETCH_HOME_USER });
      cache.writeQuery({
        query: FETCH_HOME_USER,
        data: {
          user: {
            ...user,
            notifications: user.notifications.filter(n => n.id !== notification.id)
          }
        }
      });
    }
  });

  const [acceptConnection, { loading: connectLoading }] = useMutation(ACCEPT_CONNECTION, {
    update(cache, { data: { acceptConnection: { connection } } }) {
      const { user } = cache.readQuery({ query: FETCH_HOME_USER });
      cache.writeQuery({
        query: FETCH_HOME_USER,
        data: {
          user: {
            ...user,
            receivedConnections: user.receivedConnections.filter(c => c.id !== connection.id)
          }
        },
      });
    }
  });

  const [deleteConnection, { loading: deleteLoading }] = useMutation(DELETE_CONNECTION, {
    update(cache, { data: { deleteConnection: { connection } } }) {
      const { user } = cache.readQuery({ query: FETCH_HOME_USER });
      cache.writeQuery({
        query: FETCH_HOME_USER,
        data: {
          user: {
            ...user,
            receivedConnections: user.receivedConnections.filter(c => c.id !== connection.id)
          }
        },
      });
    }
  });

  if (loading || !data)
    return (
      <div className="flex justify-center h-screen items-center">
        <HashLoader size={150} loading={!loading} color="#136FE7" />
      </div>
    );

  if (error) return <p>There was an error: {error}</p>;

  const receivedConnections = data.user.receivedConnections.filter(c => c.status === 'PENDING');

  const notificationCount = receivedConnections.length + data.user.notifications.length;

  return (
    <div className="pt-24 pb-6 bg-gray-200">
      <div className="profile-card pb-4 bg-white mx-6 shadow-md overflow-hidden">
        <div className="flex justify-between">
          <div className="flex pl-2 pt-4">
            <svg
              className=""
              width="25"
              height="30"
              viewBox="0 0 18 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.3469 6.07C15.4124 5.90162 15.4082 5.71415 15.3354 5.54884C15.2626 5.38353 15.1271 5.25391 14.9587 5.18851C14.7903 5.1231 14.6028 5.12726 14.4375 5.20008C14.2722 5.2729 14.1426 5.4084 14.0772 5.57678C13.7832 6.32204 13.6312 7.11569 13.6289 7.91683C13.6331 8.72593 13.7843 9.52754 14.075 10.2826C14.1387 10.4516 14.2668 10.5883 14.4313 10.6628C14.5958 10.7373 14.7831 10.7433 14.9521 10.6797C15.1211 10.616 15.2578 10.4878 15.3323 10.3233C15.4067 10.1589 15.4128 9.97153 15.3491 9.80256C14.8685 8.52677 14.868 7.30524 15.3469 6.07ZM12.905 10.7309C12.0139 8.8364 12.0133 7.00821 12.905 5.1411C12.9982 4.94522 13.0143 4.72144 12.9502 4.5142C12.886 4.30697 12.7463 4.13144 12.5587 4.02247C12.3711 3.9135 12.1494 3.87906 11.9376 3.92598C11.7258 3.97291 11.5394 4.09777 11.4155 4.27578C11.3884 4.31402 11.3647 4.35454 11.3448 4.39689C10.7885 5.56363 10.5107 6.74187 10.5107 7.9234C10.5107 9.10494 10.788 10.2876 11.3426 11.4664C11.363 11.5103 11.3874 11.5523 11.4155 11.5919C11.5397 11.7682 11.7253 11.8917 11.936 11.938C12.1466 11.9843 12.367 11.9502 12.5537 11.8422C12.7405 11.7343 12.8801 11.5604 12.9451 11.3547C13.0101 11.1491 12.9958 10.9266 12.905 10.7309ZM3.98868 13.3099C3.95709 13.2261 3.90929 13.1493 3.84802 13.0839C3.78674 13.0185 3.71319 12.9659 3.63157 12.9289C3.54994 12.892 3.46184 12.8715 3.37229 12.8686C3.28274 12.8657 3.1935 12.8804 3.10966 12.912C3.02581 12.9436 2.94902 12.9914 2.88365 13.0527C2.81828 13.114 2.76562 13.1875 2.72867 13.2691C2.69173 13.3508 2.67122 13.4389 2.66833 13.5284C2.66543 13.618 2.6802 13.7072 2.71179 13.7911C3.19241 15.0679 3.1935 16.2895 2.71453 17.5247C2.64913 17.6931 2.65329 17.8806 2.72611 18.0459C2.79892 18.2112 2.93442 18.3408 3.10281 18.4062C3.27119 18.4716 3.45865 18.4675 3.62396 18.3946C3.78928 18.3218 3.91889 18.1863 3.9843 18.0179C4.27801 17.2726 4.43004 16.479 4.43258 15.6779C4.42915 14.8682 4.27875 14.0659 3.98868 13.3099ZM6.8077 12.307C6.78084 12.2467 6.75289 12.187 6.72495 12.1267C6.67753 12.0226 6.60992 11.929 6.52605 11.8513C6.44219 11.7735 6.34372 11.7132 6.23636 11.6738C6.129 11.6344 6.01489 11.6166 5.90063 11.6216C5.78637 11.6267 5.67425 11.6543 5.57075 11.703C5.46726 11.7516 5.37445 11.8203 5.29771 11.9051C5.22097 11.9899 5.16183 12.0891 5.1237 12.197C5.08558 12.3048 5.06924 12.4191 5.07562 12.5333C5.08201 12.6475 5.11099 12.7593 5.1609 12.8622C6.05252 14.7567 6.05307 16.5854 5.1609 18.452C5.11203 18.5544 5.08382 18.6655 5.07788 18.7788C5.07194 18.8922 5.08838 19.0056 5.12627 19.1126C5.16415 19.2196 5.22274 19.3181 5.29869 19.4024C5.37463 19.4868 5.46645 19.5553 5.5689 19.6042C5.67134 19.653 5.78241 19.6813 5.89576 19.6872C6.0091 19.6931 6.12251 19.6767 6.2295 19.6388C6.3365 19.6009 6.43498 19.5423 6.51933 19.4664C6.60368 19.3904 6.67224 19.2986 6.72111 19.1962C6.75015 19.1353 6.77591 19.0745 6.8055 19.0137C7.30493 17.9067 7.55483 16.7924 7.5552 15.6708C7.55739 14.5512 7.30749 13.4277 6.8077 12.3087V12.307Z"
                fill="url(#paint0_linear)"
              />
              <path
                d="M11.0092 15.6609C11.0092 17.2321 10.6042 18.8032 9.79369 20.3634C9.66244 20.6043 9.442 20.784 9.1797 20.8641C8.9174 20.9442 8.63415 20.9183 8.39076 20.7919C8.14736 20.6655 7.96323 20.4487 7.87788 20.1881C7.79253 19.9274 7.81277 19.6437 7.93426 19.3978C9.11798 17.1192 9.22923 14.8986 8.268 12.6309C7.38788 10.8191 7.05469 9.50333 7.05469 7.9338C7.05469 6.36427 7.46022 4.79146 8.27074 3.23124C8.33415 3.10919 8.42097 3.00081 8.52625 2.91231C8.63154 2.82381 8.75323 2.75691 8.88437 2.71544C9.01551 2.67396 9.15353 2.65873 9.29056 2.67059C9.42759 2.68246 9.56094 2.7212 9.68299 2.78461C9.80505 2.84801 9.91342 2.93483 10.0019 3.04012C10.0904 3.1454 10.1573 3.26709 10.1988 3.39823C10.2403 3.52937 10.2555 3.66739 10.2436 3.80442C10.2318 3.94145 10.193 4.0748 10.1296 4.19685C8.9459 6.47552 8.8352 8.6961 9.79643 10.9638C10.6212 12.792 11.0092 14.0914 11.0092 15.6609Z"
                fill="black"
              />
              <defs>
                <linearGradient
                  id="paint0_linear"
                  x1="5.2575"
                  y1="4.86701"
                  x2="13.7806"
                  y2="27.5577"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#933EFF" />
                  <stop offset="1" stopColor="#0047FF" />
                </linearGradient>
              </defs>
            </svg>
            <p className="text-lg">231</p>
          </div>
          <img
            className="rounded-full shadow-lg w-96 h-96 object-cover -mt-8 ml-2"
            src={data.user.picture}
            alt={`profile picuture of ${data.user.name}`}
          />
        </div>
        <div className="flex justify-center">
          <h1 className="text-3xl pt-10">{data.user.name}</h1>
        </div>
        {qrCode && (
          <div className="flex justify-center my-6">
            <span className="qr-box p-4">
              <QRCode
                includeMargin={false}
                level="Q"
                renderAs="svg"
                value={`https://swaap.co/qrLink/${qrCode}`}
              />
            </span>
          </div>
        )}
        {/* <div className="pt-24 pb-6 bg-gray-100">
      <div className="main-container flex flex-col items-center py-4 bg-white mx-6 shadow-xl overflow-hidden">
        <img
          className="rounded-full shadow-md w-96 h-96 object-cover"
          src={data.user.picture}
          alt={`profile picuture of ${data.user.name}`}
        />
        <h1 className="text-3xl mt-6">{data.user.name}</h1> */}
      </div>
      <div className="flex justify-center my-10">
        <div className="purple rounded-full p-6">
          <Link to="scanqr">
            <svg
              width="41"
              height="41"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M36.1655 30.4685C36.1655 31.2239 35.8654 31.9483 35.3313 32.4824C34.7971 33.0166 34.0727 33.3166 33.3173 33.3166H7.68408C6.9287 33.3166 6.20427 33.0166 5.67014 32.4824C5.13601 31.9483 4.83594 31.2239 4.83594 30.4685V14.8037C4.83594 14.0484 5.13601 13.3239 5.67014 12.7898C6.20427 12.2557 6.9287 11.9556 7.68408 11.9556H13.3804L16.2285 7.6834H24.7729L27.6211 11.9556H33.3173C34.0727 11.9556 34.7971 12.2557 35.3313 12.7898C35.8654 13.3239 36.1655 14.0484 36.1655 14.8037V30.4685Z"
                stroke="white"
                strokeWidth="2.84814"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.501 27.6204C23.6469 27.6204 26.1972 25.0701 26.1972 21.9241C26.1972 18.7781 23.6469 16.2278 20.501 16.2278C17.355 16.2278 14.8047 18.7781 14.8047 21.9241C14.8047 25.0701 17.355 27.6204 20.501 27.6204Z"
                stroke="white"
                strokeWidth="2.84814"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
      <div className="profile-card bg-white w-11/12 pb-4 mx-auto">
        <div className="flex mx-4 pt-4 my-6 items-center">
          <div className="relative">
            <svg
              width="23"
              height="21"
              viewBox="0 0 23 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.3263 4.97082C21.9776 4.16337 21.4748 3.43167 20.846 2.81667C20.2168 2.19984 19.4748 1.70965 18.6606 1.37276C17.8163 1.02204 16.9108 0.842522 15.9966 0.844627C14.7139 0.844627 13.4626 1.19585 12.3751 1.85927C12.1149 2.01797 11.8678 2.19228 11.6336 2.38219C11.3995 2.19228 11.1523 2.01797 10.8921 1.85927C9.80466 1.19585 8.55327 0.844627 7.27066 0.844627C6.34708 0.844627 5.45212 1.02154 4.60658 1.37276C3.78967 1.71097 3.05341 2.19748 2.42121 2.81667C1.7916 3.43097 1.28866 4.16285 0.940875 4.97082C0.579248 5.81115 0.394531 6.70352 0.394531 7.62189C0.394531 8.48824 0.571443 9.39101 0.922664 10.3094C1.21665 11.0769 1.63811 11.873 2.17665 12.6769C3.02999 13.9491 4.20333 15.2759 5.66025 16.621C8.07457 18.8506 10.4655 20.3907 10.5669 20.4532L11.1835 20.8486C11.4567 21.0229 11.8079 21.0229 12.0811 20.8486L12.6977 20.4532C12.7991 20.3881 15.1874 18.8506 17.6044 16.621C19.0613 15.2759 20.2346 13.9491 21.088 12.6769C21.6265 11.873 22.0506 11.0769 22.3419 10.3094C22.6932 9.39101 22.8701 8.48824 22.8701 7.62189C22.8727 6.70352 22.688 5.81115 22.3263 4.97082ZM11.6336 18.7907C11.6336 18.7907 2.37178 12.8564 2.37178 7.62189C2.37178 4.97082 4.56496 2.82187 7.27066 2.82187C9.17246 2.82187 10.8219 3.88334 11.6336 5.43392C12.4453 3.88334 14.0948 2.82187 15.9966 2.82187C18.7023 2.82187 20.8954 4.97082 20.8954 7.62189C20.8954 12.8564 11.6336 18.7907 11.6336 18.7907Z"
                fill="black"
              />
            </svg>
            {notificationCount > 0 && (
              <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-purple-700 text-white w-5 h-5 text-xs rounded-full leading-none flex items-center justify-center">
                {notificationCount}
              </div>
            )}
          </div>
          <p className="text-xl ml-12">Notifications</p>
        </div>
        <p className="ml-4 mt-4 text-xl text-gray-500">New Messages</p>
        {!data.user.notifications.length ? (
          <div className="flex flex-col items-center my-16">
            <svg
              width="90"
              height="93"
              viewBox="0 0 90 93"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M89 33.5V92.5H1V33.5L46 65L89 33.5Z" fill="#6640FF" />
              <path
                d="M89 92.5V33.5L46 65M89 92.5H1M89 92.5L46 65M1 92.5V33.5L46 65M1 92.5L46 65"
                stroke="#003A8C"
              />
              <path d="M46.5 1L1 33L46 64.5L89 33L46.5 1Z" fill="white" stroke="#BFBFBF" />
              <path
                d="M39 44C39 44 42.6246 47.7097 45.5 47.5C48.0392 47.3149 51 44 51 44"
                stroke="#595959"
                strokeLinecap="round"
              />
              <circle cx="27" cy="30" r="3" fill="#595959" />
              <circle cx="63" cy="30" r="3" fill="#595959" />
            </svg>
            <p className="text-xl mt-10 text-gray-500">You are all caught up!</p>
          </div>
        ) : (
            <ul className="my-5">
              {data.user.notifications.map(n => (
                <li
                  key={n.id}
                  className="flex items-center justify-between mx-4 bg-gray-100 p-3 rounded-lg"
                >
                  <span className="mr-1">{n.message}</span>
                  <button
                    onClick={() => dismissNotification({ variables: { id: n.id } })}
                    disabled={dismissLoading}
                    className="text-2xl focus:outline-none"
                  >
                    &times;
                </button>
                </li>
              ))}
            </ul>
          )}
        <p className="ml-4 text-xl text-gray-500">New Requests</p>
        {!receivedConnections.length ? (
          <div className="flex flex-col items-center my-16">
            <svg
              width="124"
              height="95"
              viewBox="0 0 124 95"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M56 46.5085C56 46.5085 59.6246 42.7989 62.5 43.0085C65.0392 43.1937 68 46.5085 68 46.5085"
                stroke="black"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="44" cy="27" r="3" fill="black" />
              <circle cx="80" cy="27" r="3" fill="black" />
              <g opacity="0.5">
                <path
                  d="M58.6282 0H30.8827C29.2882 0 28 1.28819 28 2.88265V30.6282C28 31.0246 28.3243 31.3489 28.7207 31.3489H58.6282C59.0246 31.3489 59.3489 31.0246 59.3489 30.6282V0.720663C59.3489 0.324298 59.0246 0 58.6282 0ZM53.5835 25.5835H33.7653V5.76531H53.5835V25.5835ZM41.1521 18.9174H46.1967C46.5931 18.9174 46.9174 18.5931 46.9174 18.1967V13.1521C46.9174 12.7557 46.5931 12.4314 46.1967 12.4314H41.1521C40.7557 12.4314 40.4314 12.7557 40.4314 13.1521V18.1967C40.4314 18.5931 40.7557 18.9174 41.1521 18.9174ZM58.6282 37.8348H28.7207C28.3243 37.8348 28 38.1591 28 38.5555V66.301C28 67.8955 29.2882 69.1837 30.8827 69.1837H58.6282C59.0246 69.1837 59.3489 68.8594 59.3489 68.463V38.5555C59.3489 38.1591 59.0246 37.8348 58.6282 37.8348ZM53.5835 63.4184H33.7653V43.6001H53.5835V63.4184ZM41.1521 56.7522H46.1967C46.5931 56.7522 46.9174 56.4279 46.9174 56.0316V50.9869C46.9174 50.5906 46.5931 50.2663 46.1967 50.2663H41.1521C40.7557 50.2663 40.4314 50.5906 40.4314 50.9869V56.0316C40.4314 56.4279 40.7557 56.7522 41.1521 56.7522ZM94.301 0H66.5555C66.1591 0 65.8348 0.324298 65.8348 0.720663V30.6282C65.8348 31.0246 66.1591 31.3489 66.5555 31.3489H96.463C96.8594 31.3489 97.1837 31.0246 97.1837 30.6282V2.88265C97.1837 1.28819 95.8955 0 94.301 0ZM91.4184 25.5835H71.6001V5.76531H91.4184V25.5835ZM78.9869 18.9174H84.0316C84.4279 18.9174 84.7522 18.5931 84.7522 18.1967V13.1521C84.7522 12.7557 84.4279 12.4314 84.0316 12.4314H78.9869C78.5906 12.4314 78.2663 12.7557 78.2663 13.1521V18.1967C78.2663 18.5931 78.5906 18.9174 78.9869 18.9174ZM96.463 37.8348H92.139C91.7427 37.8348 91.4184 38.1591 91.4184 38.5555V50.6266H84.3919V38.5555C84.3919 38.1591 84.0676 37.8348 83.6712 37.8348H66.5555C66.1591 37.8348 65.8348 38.1591 65.8348 38.5555V68.463C65.8348 68.8594 66.1591 69.1837 66.5555 69.1837H70.8795C71.2758 69.1837 71.6001 68.8594 71.6001 68.463V46.4828H78.6266V55.6712C78.6266 56.0676 78.9509 56.3919 79.3473 56.3919H96.463C96.8594 56.3919 97.1837 56.0676 97.1837 55.6712V38.5555C97.1837 38.1591 96.8594 37.8348 96.463 37.8348ZM83.6712 63.4184H79.3473C78.9509 63.4184 78.6266 63.7427 78.6266 64.139V68.463C78.6266 68.8594 78.9509 69.1837 79.3473 69.1837H83.6712C84.0676 69.1837 84.3919 68.8594 84.3919 68.463V64.139C84.3919 63.7427 84.0676 63.4184 83.6712 63.4184ZM96.463 63.4184H92.139C91.7427 63.4184 91.4184 63.7427 91.4184 64.139V68.463C91.4184 68.8594 91.7427 69.1837 92.139 69.1837H96.463C96.8594 69.1837 97.1837 68.8594 97.1837 68.463V64.139C97.1837 63.7427 96.8594 63.4184 96.463 63.4184Z"
                  fill="#8C8C8C"
                />
                <path
                  d="M56 46.5085C56 46.5085 59.6246 42.7989 62.5 43.0085C65.0392 43.1937 68 46.5085 68 46.5085"
                  stroke="#262626"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="44" cy="27" r="3" fill="#262626" />
                <circle cx="80" cy="27" r="3" fill="#262626" />
                <path
                  d="M6.81184 64.9364C6.89334 66.3147 8.07675 67.3659 9.45505 67.2844C10.8334 67.2029 11.8846 66.0195 11.8031 64.6412L6.81184 64.9364ZM28.8047 40.2888C28.8047 37.7888 28.8037 37.7888 28.8026 37.7888C28.8022 37.7888 28.8011 37.7888 28.8003 37.7888C28.7987 37.7888 28.7969 37.7888 28.795 37.7888C28.7911 37.7888 28.7867 37.7889 28.7816 37.7889C28.7714 37.789 28.7588 37.7891 28.7438 37.7893C28.7139 37.7897 28.6743 37.7904 28.6256 37.7916C28.5283 37.7942 28.3943 37.799 28.2275 37.8082C27.8942 37.8266 27.4278 37.8625 26.8587 37.9325C25.7243 38.0722 24.1601 38.3502 22.4178 38.9078C18.9483 40.018 14.6016 42.2968 11.6848 46.9638L15.9248 49.6138C18.0079 46.2808 21.1612 44.5597 23.9417 43.6699C25.3243 43.2274 26.5726 43.0055 27.4695 42.8951C27.916 42.8401 28.2699 42.8135 28.503 42.8006C28.6194 42.7942 28.7051 42.7913 28.7567 42.7899C28.7825 42.7892 28.7997 42.789 28.8079 42.7889C28.8119 42.7888 28.8137 42.7888 28.8132 42.7888C28.813 42.7888 28.8122 42.7888 28.8107 42.7888C28.81 42.7888 28.8092 42.7888 28.8082 42.7888C28.8077 42.7888 28.8068 42.7888 28.8065 42.7888C28.8056 42.7888 28.8047 42.7888 28.8047 40.2888ZM11.6848 46.9638C8.95807 51.3266 7.74757 55.7956 7.21248 59.1443C6.94397 60.8248 6.84243 62.2423 6.80848 63.2516C6.79149 63.7569 6.79138 64.1617 6.79597 64.448C6.79827 64.5912 6.80175 64.705 6.80489 64.7871C6.80646 64.8282 6.80796 64.8613 6.80918 64.8863C6.80979 64.8987 6.81033 64.9092 6.81078 64.9175C6.81101 64.9217 6.81121 64.9254 6.81139 64.9285C6.81148 64.9301 6.81156 64.9315 6.81164 64.9328C6.81167 64.9335 6.81172 64.9344 6.81174 64.9347C6.81179 64.9355 6.81184 64.9364 9.30748 64.7888C11.8031 64.6412 11.8032 64.642 11.8032 64.6427C11.8032 64.6429 11.8033 64.6436 11.8033 64.644C11.8033 64.6447 11.8034 64.6454 11.8034 64.6459C11.8035 64.647 11.8035 64.6476 11.8035 64.6476C11.8035 64.6478 11.8034 64.6459 11.8032 64.642C11.8028 64.6344 11.8021 64.6188 11.8012 64.5956C11.7994 64.5493 11.797 64.4727 11.7953 64.3678C11.792 64.1581 11.7916 63.8363 11.8057 63.4197C11.8337 62.5852 11.919 61.3778 12.1498 59.9333C12.6134 57.032 13.6516 53.251 15.9248 49.6138L11.6848 46.9638Z"
                  fill="#8C8C8C"
                />
                <path
                  d="M116.993 64.9364C116.911 66.3147 115.728 67.3659 114.35 67.2844C112.971 67.2029 111.92 66.0195 112.002 64.6412L116.993 64.9364ZM95 40.2888C95 37.7888 95.001 37.7888 95.0021 37.7888C95.0025 37.7888 95.0036 37.7888 95.0044 37.7888C95.006 37.7888 95.0078 37.7888 95.0097 37.7888C95.0135 37.7888 95.018 37.7889 95.0231 37.7889C95.0332 37.789 95.0458 37.7891 95.0608 37.7893C95.0908 37.7897 95.1304 37.7904 95.1791 37.7916C95.2764 37.7942 95.4104 37.799 95.5772 37.8082C95.9105 37.8266 96.3769 37.8625 96.946 37.9325C98.0804 38.0722 99.6446 38.3502 101.387 38.9078C104.856 40.018 109.203 42.2968 112.12 46.9638L107.88 49.6138C105.797 46.2808 102.644 44.5597 99.863 43.6699C98.4804 43.2274 97.2321 43.0055 96.3352 42.8951C95.8887 42.8401 95.5348 42.8135 95.3017 42.8006C95.1853 42.7942 95.0996 42.7913 95.048 42.7899C95.0222 42.7892 95.005 42.789 94.9968 42.7889C94.9928 42.7888 94.9909 42.7888 94.9914 42.7888C94.9917 42.7888 94.9925 42.7888 94.994 42.7888C94.9947 42.7888 94.9955 42.7888 94.9965 42.7888C94.997 42.7888 94.9979 42.7888 94.9981 42.7888C94.9991 42.7888 95 42.7888 95 40.2888ZM112.12 46.9638C114.847 51.3266 116.057 55.7956 116.592 59.1443C116.861 60.8248 116.962 62.2423 116.996 63.2516C117.013 63.7569 117.013 64.1617 117.009 64.448C117.006 64.5912 117.003 64.705 117 64.7871C116.998 64.8282 116.997 64.8613 116.996 64.8863C116.995 64.8987 116.994 64.9092 116.994 64.9175C116.994 64.9217 116.993 64.9254 116.993 64.9285C116.993 64.9301 116.993 64.9315 116.993 64.9328C116.993 64.9335 116.993 64.9344 116.993 64.9347C116.993 64.9355 116.993 64.9364 114.497 64.7888C112.002 64.6412 112.002 64.642 112.001 64.6427C112.001 64.6429 112.001 64.6436 112.001 64.644C112.001 64.6447 112.001 64.6454 112.001 64.6459C112.001 64.647 112.001 64.6476 112.001 64.6476C112.001 64.6478 112.001 64.6459 112.001 64.642C112.002 64.6344 112.003 64.6188 112.003 64.5956C112.005 64.5493 112.008 64.4727 112.009 64.3678C112.013 64.1581 112.013 63.8363 111.999 63.4197C111.971 62.5852 111.886 61.3778 111.655 59.9333C111.191 57.032 110.153 53.251 107.88 49.6138L112.12 46.9638Z"
                  fill="#8C8C8C"
                />
                <line
                  x1="44.5"
                  y1="68.5"
                  x2="44.5"
                  y2="92.5"
                  stroke="#8C8C8C"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <line
                  x1="81.5"
                  y1="68.5"
                  x2="81.5"
                  y2="92.5"
                  stroke="#8C8C8C"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>
            </svg>
            <p className="text-xl mt-10 text-gray-500">Go out and meet more people!</p>
          </div>
        ) : (
            <ul className="my-5">
              {receivedConnections.map(c => (
                <li
                  key={c.id}
                  className="flex items-center justify-between mx-4 bg-gray-100 p-3 rounded-lg mt-3"
                >
                  <img
                    src={c.sender.picture}
                    alt="what they look like"
                    className="rounded-full w-16 h-16 object-cover"
                  />
                  <h3 className="font-bold truncate w-1/3">{c.sender.name}</h3>
                  <div>
                    <button
                      className="rounded-lg px-3 py-2 bg-purple-500 mr-3 text-white"
                      onClick={() => {
                        const { latitude, longitude } = position.coords;
                        acceptConnection({
                          variables: {
                            id: c.id,
                            receiverCoords: { latitude, longitude }
                          },
                          optimisticResponse: {
                            __typename: 'Mutation',
                            acceptConnection: {
                              __typename: 'ProfileMutationResponse',
                              code: 200,
                              success: true,
                              message: 'Connection request accepted',
                              connection: {
                                __typename: 'Connection',
                                id: c.id
                              }
                            }
                          }
                        });
                      }}
                      disabled={connectLoading}
                    >
                      Accept
                    </button>
                    <button
                      className="rounded-lg text-red-500"
                      onClick={() => deleteConnection({
                        variables: { id: c.id },
                        optimisticResponse: {
                          __typename: 'Mutation',
                          deleteConnection: {
                            __typename: 'ProfileMutationResponse',
                            code: 200,
                            success: true,
                            message: 'Connection deleted successfully',
                            connection: {
                              __typename: 'Connection',
                              id: c.id
                            }
                          }
                        }
                      })}
                      disabled={deleteLoading}
                    >
                      <p className="text-2xl">
                        &times;
                      </p>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
      </div>

      <div className="profile-card bg-white w-11/12 pb-4 mx-auto">
        <div className="flex justify-between mx-4 pt-4 my-6">
          <p className="text-xl mr-10">Events</p>
          <p className="text-lg">view all</p>
        </div>
        <div className="flex flex-col items-center my-10">
          <svg
            width="103"
            height="114"
            viewBox="0 0 103 114"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="8.30078" y="19.5441" width="93.812" height="93.812" fill="#E8E8E8" />
            <path
              d="M1.15361 102.629C1.31286 102.435 1.48915 102.203 1.67835 101.929C2.45789 100.799 3.45499 98.9513 4.38374 96.0405C6.24017 90.2222 7.82847 80.1399 6.85104 63.0014C5.8769 45.9206 6.36592 35.0781 7.09453 28.5163C7.45879 25.2358 7.88273 23.0272 8.2129 21.6453C8.37797 20.9544 8.51952 20.4704 8.61834 20.1627C8.63213 20.1198 8.64508 20.0803 8.65715 20.0441H101.63C101.635 20.2447 101.641 20.5049 101.648 20.8203C101.667 21.6376 101.693 22.8258 101.721 24.3089C101.779 27.2752 101.847 31.4209 101.893 36.1383C101.985 45.5753 101.985 57.2915 101.619 66.4301C101.309 74.1619 100.577 84.0474 99.9214 92.0047C99.5938 95.9823 99.2857 99.4762 99.0594 101.976C98.9463 103.225 98.8537 104.227 98.7893 104.915C98.7671 105.153 98.7483 105.353 98.7331 105.513L1.15361 102.629Z"
              fill="#FAFAFA"
              stroke="#E8E8E8"
            />
            <rect x="8.30078" width="93.812" height="19.5442" fill="#6640FF" />
            <path
              d="M49.3438 64.4957C49.3438 64.4957 52.8858 68.1208 55.6956 67.916C58.1769 67.735 61.0702 64.4957 61.0702 64.4957"
              stroke="#595959"
              strokeLinecap="round"
            />
            <circle cx="37.6191" cy="50.8148" r="2.93162" fill="#595959" />
            <circle cx="72.7988" cy="50.8148" r="2.93162" fill="#595959" />
            <path
              d="M42.5547 7.32617H39.8125V14.9316H38.6934V7.32617H35.9571V6.40039H42.5547V7.32617ZM50.6188 10.9414C50.6188 11.7773 50.4781 12.5078 50.1969 13.1328C49.9156 13.7539 49.5172 14.2285 49.0016 14.5566C48.486 14.8848 47.8844 15.0488 47.1969 15.0488C46.525 15.0488 45.9293 14.8848 45.4098 14.5566C44.8903 14.2246 44.486 13.7539 44.1969 13.1445C43.9117 12.5312 43.7653 11.8223 43.7574 11.0176V10.4023C43.7574 9.58203 43.9 8.85742 44.1852 8.22852C44.4703 7.59961 44.8727 7.11914 45.3922 6.78711C45.9156 6.45117 46.5133 6.2832 47.1852 6.2832C47.8688 6.2832 48.4703 6.44922 48.9899 6.78125C49.5133 7.10938 49.9156 7.58789 50.1969 8.2168C50.4781 8.8418 50.6188 9.57031 50.6188 10.4023V10.9414ZM49.4996 10.3906C49.4996 9.37891 49.2965 8.60352 48.8903 8.06445C48.484 7.52148 47.9156 7.25 47.1852 7.25C46.4742 7.25 45.9137 7.52148 45.5035 8.06445C45.0973 8.60352 44.8883 9.35352 44.8766 10.3145V10.9414C44.8766 11.9219 45.0817 12.6934 45.4918 13.2559C45.9059 13.8145 46.4742 14.0938 47.1969 14.0938C47.9235 14.0938 48.486 13.8301 48.8844 13.3027C49.2828 12.7715 49.4879 12.0117 49.4996 11.0234V10.3906ZM52.7063 14.9316V6.40039H55.1145C55.8567 6.40039 56.5129 6.56445 57.0832 6.89258C57.6535 7.2207 58.093 7.6875 58.4016 8.29297C58.7141 8.89844 58.8723 9.59375 58.8762 10.3789V10.9238C58.8762 11.7285 58.7199 12.4336 58.4074 13.0391C58.0988 13.6445 57.6555 14.1094 57.0774 14.4336C56.5031 14.7578 55.8332 14.9238 55.0676 14.9316H52.7063ZM53.8313 7.32617V14.0117H55.0149C55.8821 14.0117 56.5559 13.7422 57.0363 13.2031C57.5207 12.6641 57.7629 11.8965 57.7629 10.9004V10.4023C57.7629 9.43359 57.5344 8.68164 57.0774 8.14648C56.6242 7.60742 55.9797 7.33398 55.1438 7.32617H53.8313ZM65.5633 12.7051H61.9891L61.1863 14.9316H60.0262L63.284 6.40039H64.2684L67.5321 14.9316H66.3778L65.5633 12.7051ZM62.3289 11.7793H65.2293L63.7762 7.78906L62.3289 11.7793ZM71.1313 10.6836L73.3578 6.40039H74.6352L71.6938 11.75V14.9316H70.5688V11.75L67.6274 6.40039H68.9164L71.1313 10.6836Z"
              fill="white"
              fillOpacity="0.8"
            />
          </svg>

          <p className="text-xl mt-10 text-gray-500">You dont't have any events yet.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
