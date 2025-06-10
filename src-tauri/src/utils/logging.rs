#[macro_export]
macro_rules! log_err_or_return {
  ($res:expr, $msg:expr) => {{
    match $res {
      Ok(val) => val,
      Err(err) => {
        tracing::error!("{}: {:?}", $msg, err);
        
        return Err(err.into());
      }
    }
  }};
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
