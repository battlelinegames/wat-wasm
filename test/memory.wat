(module
  (memory 32767) ;; compile max 65_536
  (func (export "mem_test")
    (result i32)
    (i32.store
      (i32.const 2_000_000_000)
      (i32.const 99) )

    (i32.load (i32.const 2_000_000_000))
  )
)