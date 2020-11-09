(module
 (type $i32_i32_=>_none (func (param i32 i32)))
 (type $i32_=>_i32 (func (param i32) (result i32)))
 (import "env" "log" (func $fimport$0 (param i32 i32)))
 (export "loop_test" (func $0))
 (func $0 (; 1 ;) (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local.set $2
   (i32.const 1)
  )
  (loop $label$1
   (block $label$2
    (local.set $1
     (i32.add
      (local.get $1)
      (i32.const 1)
     )
    )
    (local.set $2
     (i32.mul
      (local.get $1)
      (local.get $2)
     )
    )
    (call $fimport$0
     (local.get $1)
     (local.get $2)
    )
    (br_if $label$2
     (i32.eq
      (local.get $0)
      (local.get $1)
     )
    )
    (br $label$1)
   )
  )
  (local.get $2)
 )
 ;; custom section "linking", size 7
 ;; custom section "reloc.Code", size 5
)
