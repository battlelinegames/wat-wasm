(module
 (export "AddInt" (func $0))
 (func $0 (; 0 ;) (;param $0 i32) (param $1 i32;) (result i32)
  (i32.add
   (i32.const 5) ;;(local.get $0)
   (i32.const 15) ;;(local.get $1)
  )
 )
 ;; custom section "linking", size 1
)
