#[macro_export]
macro_rules! log_err_or_return {
  ($res:expr, $msg:expr) => {
    $res.map_err(|err| {
      let full_msg = format!("{}: {:?}", $msg, err);
      
      tracing::error!("{}", full_msg);
      
      full_msg
    })?
  };
}

#[macro_export]
macro_rules! log_err_and_continue {
  ($res:expr, $msg:expr) => {{
    $res.map_err(|err| {
      tracing::error!("{}: {:?}", $msg, err);

      err
    })
  }};
}

#[macro_export]
macro_rules! log_err_and_ignore {
  ($res:expr, $msg:expr) => {{
    if let Err(err) = $res {
      tracing::error!("{}: {:?}", $msg, err);
    }
  }};
}
