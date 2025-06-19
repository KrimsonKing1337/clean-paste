import { useNavigate } from 'react-router';

export const Config = () => {
  const navigate = useNavigate();

  const clickHandler = () => {
    navigate('/');
  };

  return (
    <div>
      Config

      <div onClick={clickHandler}>
        Go back to Main
      </div>
    </div>
  );
};
