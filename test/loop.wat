(module
  (import "env" "log" (func $log (param i32 i32)))

  (func $loop_test (export "loop_test") (param $n i32)
    (result i32)

    (local $i         i32)
    (local $factorial i32)
    
    (local.set $factorial (i32.const 1))

    (loop ;;$continue 
    (block ;;$break	;; $continue loop and $break block
      (local.set $i            	;; $i++	
        (i32.add (local.get $i) (i32.const 1))
      )

      ;; value of $i factorial
      (local.set $factorial ;; $factorial = $i * $factorial	
        (i32.mul (local.get $i) (local.get $factorial))
      )
	
      ;; call $log passing parameters $i, $factorial
      (call $log (local.get $i) (local.get $factorial)) 
      
      local.get $n
      local.get $i
      i32.eq
      br_if 0;;$break 
      br 1;;$continue        ;; branch to top of loop
    ))

    local.get $factorial  ;; return $factorial to calling JavaScript
  )
)