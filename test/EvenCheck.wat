(func $even_check (param $n i32) (result i32)
		local.get $n
		i32.const 2
		i32.rem_u ;; if you take the remainder of a division by 2
		i32.const 0 ;; even numbers will have a remainder 0
		i32.eq ;; $n % 2 == 0
)

