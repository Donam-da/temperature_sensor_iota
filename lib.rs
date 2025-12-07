// src/lib.rs

// Import các thư viện cần thiết từ WasmLib
use wasmlib::*;

// Định nghĩa các hàm và view sẽ được export
#[no_mangle]
fn on_load() {
    let exports = ScExports::new();
    // Hàm để gửi dữ liệu
    exports.add_func("submitData", func_submit_data);
    // View để đọc dữ liệu
    exports.add_view("getData", view_get_data);
}

// Hàm `submitData`
// Nhận dữ liệu từ cảm biến và lưu vào state của contract
// Params: deviceId (String), value (Int64)
pub fn func_submit_data(ctx: &ScFuncContext, f: &ScFuncContext) {
    ctx.log("sensor_data.submitData called");

    // Lấy các tham số đầu vào
    let device_id = f.params().get_string("deviceId").value();
    let data_value = f.params().get_int64("value").value();
    let timestamp = ctx.timestamp(); // Lấy timestamp của giao dịch

    // Ghi log để debug
    ctx.log(&format!("Received data from device '{}': value = {}, timestamp = {}", &device_id, data_value, timestamp));

    // Lấy state của contract để lưu trữ
    let state = f.state();
    // Tạo một map trong state để lưu dữ liệu theo deviceId
    let device_data = state.get_map(&device_id);

    // Lưu các giá trị vào map
    device_data.get_int64("value").set_value(data_value);
    device_data.get_int64("timestamp").set_value(timestamp as i64);

    ctx.log(&format!("Data for device '{}' saved successfully.", &device_id));
}

// View `getData`
// Đọc dữ liệu của một thiết bị từ state
// Params: deviceId (String)
// Returns: value (Int64), timestamp (Int64)
pub fn view_get_data(ctx: &ScViewContext, f: &ScViewContext) {
    ctx.log("sensor_data.getData called");

    let device_id = f.params().get_string("deviceId").value();

    // Lấy state của contract
    let state = f.state();
    let device_data = state.get_map(&device_id);

    // Lấy các giá trị từ state
    let value = device_data.get_int64("value").value();
    let timestamp = device_data.get_int64("timestamp").value();

    // Trả về kết quả
    let results = f.results();
    results.get_int64("value").set_value(value);
    results.get_int64("timestamp").set_value(timestamp);

    ctx.log(&format!("Retrieved data for device '{}'", &device_id));
}