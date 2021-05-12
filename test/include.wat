(module
  (#include "./EvenCheck.wat")
  (#include "./OddCheck.wat")

  (func (export "always_0") (param $n i32) (result i32)
    local.get $n
    call $even_check
    call $odd_check
	)
)