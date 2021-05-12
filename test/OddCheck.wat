(func $odd_check (param $n i32) (result i32)
		local.get $n
		i32.const 2
		i32.rem_u ;; if you take the remainder of a division by 2
		i32.const 1 ;; odd numbers will have a remainder 1
    ;; why didn't use and?
		i32.eq ;; $n % 2 == 1
)

